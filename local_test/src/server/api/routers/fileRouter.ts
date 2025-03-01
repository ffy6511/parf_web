import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fileStorage from "./fileStorage"; // 导入共享的 fileStorage
import { z } from "zod";

export const fileRouter = createTRPCRouter({
  deleteFile: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const fileId = input.id;
      const deleted = fileStorage.delete(fileId);
      if (!deleted) {
        throw new Error('File not found');
      }
      console.log(`Deleted file with ID: ${fileId}, fileStorage size after deletion: ${fileStorage.size}`); // 添加日志
      return { success: true };
    }),

  uploadFile: publicProcedure
    .input(
      z.object({
        content: z.string(),
        path: z.string(),
        isFolder: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const timestamp = Date.now();
      const fileId = timestamp;

      fileStorage.set(fileId, {
        id: fileId,
        content: input.content,
        path: input.path,
        isFolder: input.isFolder,
      });
      console.log(`Uploaded file with ID: ${fileId}, fileStorage size after upload: ${fileStorage.size}`); // 添加日志
      return { id: fileId };
    }),

  getFile: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const file = fileStorage.get(input.id);
      if (!file) {
        throw new Error('File not found');
      }
      return file;
    }),
});
