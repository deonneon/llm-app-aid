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

  directoryPath = path.resolve(process.cwd(), directoryPath);

  const isImage = (fileName: string) => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".svg",
      ".json",
      ".env",
      ".sh",
    ];
    const ext = path.extname(fileName).toLowerCase();
    return imageExtensions.includes(ext);
  };

  const isExplicitFileName = (fileName: string) => {
    const explicitFileNames = [
      "tailwind.config.ts",
      "parse.txt",
      ".gitignore",
      "README.md",
      "next-env.d.ts",
      "next.config.mjs",
      "postcss.config.js",
    ];
    return explicitFileNames.includes(fileName);
  };

  const readDirectory = (dirPath: string): DirectoryItem[] => {
    try {
      const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
      return dirents
        .filter(
          (dirent) =>
            ![".git", "node_modules", ".next"].includes(dirent.name) &&
            !isImage(dirent.name) &&
            !isExplicitFileName(dirent.name)
        )
        .map((dirent) => {
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
