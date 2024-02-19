// pages/api/content.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import fs from "fs";
import path from "path";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get((req: NextApiRequest, res: NextApiResponse) => {
  const { file } = req.query;
  if (typeof file !== "string") {
    res.status(400).json({ error: "Invalid file path" });
    return;
  }

  const filePath = path.join(
    process.cwd(),
    "app",
    ...file.split("/").filter((p) => p)
  );

  try {
    const content = fs.readFileSync(filePath, "utf8");
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: "Error reading file content" });
  }
});

export default router.handler({
  onError(err, req, res) {
    res.status(500).json({
      error: (err as Error).message,
    });
  },
});
