import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fileStorage from "./fileStorage"; // 导入共享的 fileStorage
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const fileRouter = createTRPCRouter({
  // 删除文件
  deleteFile: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const fileId = input.id;
      const deleted = fileStorage.delete(fileId);
      if (!deleted) {
        throw new Error('File not found');
      }
      console.log(`Deleted file with ID: ${fileId}, fileStorage size after deletion: ${fileStorage.size}`);
      return { success: true };
    }),

  // 上传文件夹
  uploadFolder: publicProcedure
    .input(
      z.array(
        z.object({
          content: z.string(),
          path: z.string(),
          isFolder: z.boolean(),
        })
      )
    )
    .mutation(async ({ input }) => {
      try{
        //  获取根目录
        const project_root = process.cwd();

        // 构建 output 目录的完整路径
        const outputFolderPath = path.join(project_root, 'output');

        const folderName = String(Date.now());
        const folderPath = path.join(outputFolderPath, folderName);

        await fs.mkdir(outputFolderPath, { recursive: true });

        await fs.mkdir(folderPath, { recursive: true });

        // 保存文件
        for (const file of input) {
          const filePath = path.join(folderPath, file.path);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.content);
        }

        // 返回文件夹路径作为唯一标识符
        return {  folderId: folderPath };
      }catch (error) {
        console.error("Error uploading folder:", error);
        throw new Error("Failed to upload folder");
      }
    }),

  // 上传单个文件
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
      console.log(`Uploaded file with ID: ${fileId}, fileStorage size after upload: ${fileStorage.size}`);
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