// pages/api/files.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import fs from "fs";
import path from "path";

interface DirectoryItem {
  name: string;
  children?: DirectoryItem[];
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get((req: NextApiRequest, res: NextApiResponse) => {
  const directoryPath = path.join(process.cwd(), "app");

  const readDirectory = (dirPath: string): DirectoryItem[] => {
    const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
    return dirents.map((dirent) => {
      const resPath = path.resolve(dirPath, dirent.name);
      return dirent.isDirectory()
        ? { name: dirent.name, children: readDirectory(resPath) }
        : { name: dirent.name };
    });
  };

  const files = readDirectory(directoryPath);
  res.json(files);
});

export default router.handler({
  onError(err, req, res) {
    res.status(500).json({
      error: (err as Error).message,
    });
  },
});
