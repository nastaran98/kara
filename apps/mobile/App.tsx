import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { getToday, getCurrentPhase, type Phase, type TodayState } from "@kara/domain";

import { API_BASE_URL } from "./config";
import { getStoredToken, signIn, signOut } from "./auth";

// Shape of GET /api/today — TodayState (hadActivityToday + practice) plus
// the extra context needed to complete a practice and show its phase.
// See src/app/api/today/route.ts.
type TodayResponse = TodayState & {
  userJourneyId: string | null;
  currentIndex: number;
  phases: Phase[];
  journey: { title: string; outcomeStatement: string | null } | null;
};

type Status =
  | { kind: "checkingAuth" }
  | { kind: "signedOut" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: TodayResponse };

async function authorizedFetch(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  return response.json();
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "checkingAuth" });
  const [completing, setCompleting] = useState(false);

  const loadToday = useCallback((activeToken: string) => {
    setStatus({ kind: "loading" });

    authorizedFetch("/api/today", activeToken)
      .then((data: TodayResponse) => setStatus({ kind: "ready", data }))
      .catch((error: unknown) =>
        setStatus({
          kind: "error",
          message: error instanceof Error ? error.message : String(error),
        }),
      );
  }, []);

  // On launch: do we already have a token from a previous sign-in?
  useEffect(() => {
    getStoredToken().then((stored) => {
      if (stored) {
        setToken(stored);
        loadToday(stored);
      } else {
        setStatus({ kind: "signedOut" });
      }
    });
  }, [loadToday]);

  async function handleSignIn() {
    const newToken = await signIn();

    if (!newToken) {
      setStatus({ kind: "error", message: "Sign-in was cancelled or failed." });
      return;
    }

    setToken(newToken);
    loadToday(newToken);
  }

  async function handleSignOut() {
    await signOut();
    setToken(null);
    setStatus({ kind: "signedOut" });
  }

  async function handleComplete(practiceId: string, userJourneyId: string) {
    if (!token) return;
    setCompleting(true);

    try {
      await authorizedFetch(`/api/practices/${practiceId}/complete`, token, {
        method: "POST",
        body: JSON.stringify({ userJourneyId }),
      });
      loadToday(token);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCompleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {status.kind === "checkingAuth" && <ActivityIndicator size="large" />}

      {status.kind === "signedOut" && (
        <View style={styles.card}>
          <Text style={styles.title}>Kara</Text>
          <Text style={styles.body}>Sign in to see today's practice.</Text>
          <Button title="Sign in" onPress={handleSignIn} />
        </View>
      )}

      {status.kind === "loading" && <ActivityIndicator size="large" />}

      {status.kind === "error" && (
        <View style={styles.card}>
          <Text style={styles.error}>{status.message}</Text>
          <Button
            title="Retry"
            onPress={() => (token ? loadToday(token) : handleSignIn())}
          />
          {token && (
            <Button title="Sign out" onPress={handleSignOut} color="#6d7080" />
          )}
        </View>
      )}

      {status.kind === "ready" && (
        <TodayCard
          data={status.data}
          completing={completing}
          onComplete={handleComplete}
          onSignOut={handleSignOut}
        />
      )}
    </SafeAreaView>
  );
}

function TodayCard({
  data,
  completing,
  onComplete,
  onSignOut,
}: {
  data: TodayResponse;
  completing: boolean;
  onComplete: (practiceId: string, userJourneyId: string) => void;
  onSignOut: () => void;
}) {
  // Same control flow as src/app/[locale]/(app)/today/page.tsx — no active
  // journey is checked first, then the domain's getToday()/getCurrentPhase()
  // interpret the rest. This is the actual point of the POC: this function
  // call is identical to the one the web page makes.
  if (!data.journey) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>No active journey</Text>
        <Text style={styles.body}>Choose a journey to start practicing.</Text>
        <Button title="Sign out" onPress={onSignOut} color="#6d7080" />
      </View>
    );
  }

  const today = getToday({
    hadActivityToday: data.hadActivityToday,
    practice: data.practice,
  });

  if (today.dayState === "satisfied") {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Done for today</Text>
        <Text style={styles.body}>
          You showed up. Your next practice will be here tomorrow.
        </Text>
        <Button title="Sign out" onPress={onSignOut} color="#6d7080" />
      </View>
    );
  }

  if (!today.newPractice) {
    return (
      <View style={styles.card}>
        <Text style={styles.body}>No practice found.</Text>
        <Button title="Sign out" onPress={onSignOut} color="#6d7080" />
      </View>
    );
  }

  const practice = today.newPractice;
  const phase = getCurrentPhase(data.currentIndex, data.phases);

  return (
    <View style={styles.card}>
      {phase && (
        <Text style={styles.phase}>
          Phase {phase.index} · {phase.name}
        </Text>
      )}

      <Text style={styles.type}>{practice.type}</Text>

      {practice.title && <Text style={styles.title}>{practice.title}</Text>}
      {practice.body && <Text style={styles.body}>{practice.body}</Text>}
      {practice.minutes != null && (
        <Text style={styles.minutes}>≈ {practice.minutes} min</Text>
      )}

      <Button
        title={completing ? "Saving…" : "Mark done"}
        disabled={completing || !data.userJourneyId}
        onPress={() =>
          data.userJourneyId && onComplete(practice.id, data.userJourneyId)
        }
      />

      <Button title="Sign out" onPress={onSignOut} color="#6d7080" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    gap: 12,
  },
  phase: {
    fontSize: 12,
    textTransform: "uppercase",
    color: "#5b5fa3",
  },
  type: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5b5fa3",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  minutes: {
    fontSize: 14,
    color: "#6d7080",
  },
  error: {
    color: "#b3261e",
    marginBottom: 12,
  },
});
