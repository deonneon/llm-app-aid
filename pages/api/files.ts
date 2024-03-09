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
  // Take the directory path from the query parameter `dir`, and default to "app" if not provided.
  let directoryPath = req.query.dir ? String(req.query.dir) : "app";

  // Sanitization and validation steps should go here
  // Ensure the directoryPath is safe to use and within allowed boundaries.

  // Resolving the directory path against the current working directory might not be necessary,
  // or even desired, if you're taking full paths from the query. Adjust as needed.
  directoryPath = path.resolve(process.cwd(), directoryPath);

  const readDirectory = (dirPath: string): DirectoryItem[] => {
    try {
      const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
      return dirents.map((dirent) => {
        const resPath = path.resolve(dirPath, dirent.name);
        return dirent.isDirectory()
          ? { name: dirent.name, children: readDirectory(resPath) }
          : { name: dirent.name };
      });
    } catch (error) {
      console.error("Error reading directory:", error);
      return []; // Return an empty array or handle the error as appropriate
    }
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
