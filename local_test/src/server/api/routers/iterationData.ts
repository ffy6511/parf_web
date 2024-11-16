import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises";
import path from "path";
import { ol } from "framer-motion/client";

export const iterationDataRouter = createTRPCRouter({
  getIterationData: publicProcedure
    .input(z.object({
      tempPath: z.string().optional()
    }))
    .query(async ({ input }) => {
      // 如果没有提供 tempPath，使用默认路径
      const old_dirPath = input.tempPath || 'output/frama_c_folder_1731745613852';
      const dirPath = path.join(process.cwd(), old_dirPath, '.parf_temp_files');
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
});