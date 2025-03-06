import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises";
import path from "path";
import { ol } from "framer-motion/client";

export const iterationDataRouter = createTRPCRouter({
  getIterationData: publicProcedure
    .input(z.object({
      tempPath: z.string()
    }))
    .query(async ({ input  }) => {
      // 如果没有提供 tempPath，使用默认路径
      const old_dirPath = input.tempPath;
      const dirPath = path.join(process.cwd(), 'output',old_dirPath, '.parf_temp_files');
      // const dirPath = path.join(process.cwd(), "src/app/parf_output/visual/parf_files");
      console.log("Reading files from:", dirPath);

      try {
        const files = await fs.readdir(dirPath);
        // files.sort(); // 按文件名顺序读取
        const jsonFiles = files.filter(file => path.extname(file) === ".json");
        jsonFiles.sort(); // 按文件名顺序读取

        const iterationData = await Promise.all(
          jsonFiles.map(async (file) => {
            const filePath = path.join(dirPath, file);
            const fileContent = await fs.readFile(filePath, "utf-8");
            return JSON.parse(fileContent);
          })
        );

        return iterationData;
      } catch (error) {
        console.error("Error reading files:", error);
        throw new Error("Failed to load iteration data");
      }
    }),

    getTxtFilesContent: publicProcedure
    .input(z.object({
      tempPath: z.string(),
    }))
    .query(async ({ input }) => {
      // 如果没有提供 tempPath，使用默认路径
      const old_dirPath = input.tempPath;
      const dirPath = path.join(process.cwd(), 'output', old_dirPath, '.parf_temp_files');
      console.log("Reading files from:", dirPath);

      try {
        // 读取指定目录下的所有文件
        const files = await fs.readdir(dirPath);
        
        // 筛选出以 .txt 结尾的文件
        const txtFiles = files.filter(file => path.extname(file) === ".txt");
        txtFiles.sort(); // 按文件名顺序读取

        // 确保文件夹中有两个 txt 文件
        if (txtFiles.length !== 2) {
          throw new Error("Expected exactly two .txt files.");
        }

        // 读取每个 txt 文件的内容
        const fileContents = await Promise.all(
          txtFiles.map(async (file) => {
            const filePath = path.join(dirPath, file);
            const content = await fs.readFile(filePath, "utf-8");
            return {
              fileName: file,
              content
            };
          })
        );

        return fileContents;
      } catch (error) {
        console.error("Error reading files:", error);
        throw new Error("Failed to load .txt files");
      }
    }),
    
});