"use client";

import { useState } from "react";

import { trpc } from "~/trpc/react";
import styles from "../index.module.css";

export function LatestPost() {
  const [latestPost] = trpc.post.getLatest.useSuspenseQuery();

  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const createPost = trpc.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className={styles.showcaseContainer}>
      {latestPost ? (
        <p className={styles.showcaseText}>
          Your most recent post: {latestPost.name}
        </p>
      ) : (
        <p className={styles.showcaseText}>You have no posts yet.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className={styles.form}
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
