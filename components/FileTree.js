"use client";

import { useEffect, useState, useCallback } from "react";
import { encode } from "gpt-tokenizer";

function FileTree() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [concatenated, setConcatenated] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [customText, setCustomText] = useState(""); // Step 1: New state for custom text
  const [tokenNum, setTokenNum] = useState(0);

  useEffect(() => {
    fetch("/api/files")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        const allFiles = new Set();
        const collectFiles = (items, prefix = "") => {
          items.forEach((item) => {
            // Check if it's a file (i.e., has no children)
            if (!item.children) {
              const filePath = prefix ? `${prefix}/${item.name}` : item.name;
              allFiles.add(filePath);
            } else {
              // If it's a folder, recurse into its children
              collectFiles(
                item.children,
                prefix ? `${prefix}/${item.name}` : item.name
              );
            }
          });
        };
        collectFiles(data);
        setSelectedFiles(allFiles);
      });
  }, []);

  const handleFileCheck = (filePath) => {
    setSelectedFiles((prevSelectedFiles) => {
      const newSelectedFiles = new Set(prevSelectedFiles);
      if (newSelectedFiles.has(filePath)) {
        newSelectedFiles.delete(filePath);
      } else {
        newSelectedFiles.add(filePath);
      }
      return newSelectedFiles;
    });
  };

  const handleSubmit = async () => {
    const contents = await Promise.all(
      Array.from(selectedFiles).map((file) =>
        fetch(`/api/content?file=${file}`).then((res) =>
          res.text().then((content) => ({
            fileName: file,
            content: content
              .trim()
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .join("\n"),
          }))
        )
      )
    );

    const concatenatedText =
      contents
        .map(({ fileName, content }) => `File: ${fileName}\n${content}`)
        .join("\n\n") + `\n\n${customText}`; // Append custom text

    setConcatenated(concatenatedText);

    // Tokenize and count
    const tokens = encode(concatenatedText);
    const tokenCount = tokens.length; // Get the count of tokens
    setTokenNum(tokenCount);
    // Optionally, store the tokenCount in state or use it as needed
    console.log(`Token Count: ${tokenCount}`);
    // You can set this in the state to display
  };

  const copyToClipboard = useCallback((text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopySuccess("Copied to clipboard!");
          setTimeout(() => setCopySuccess(""), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          setCopySuccess("Failed to copy");
          setTimeout(() => setCopySuccess(""), 2000);
        });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopySuccess("Copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  }, []);

  const renderTree = (items, prefix = "") => {
    return items.map((item, index) => {
      const filePath = prefix ? `${prefix}/${item.name}` : item.name;
      return (
        <div key={index}>
          <div
            className="flex flex-row items-center"
            style={{ marginLeft: prefix ? "20px" : "0px" }}
          >
            {item.children ? (
              <>
                {/* Folder Icon */}
                <input
                  type="checkbox"
                  checked={selectedFiles.has(filePath)}
                  onChange={() => handleFileCheck(filePath)}
                  className="mr-2"
                  disabled
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500 mr-2 "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 002-2V7a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span>{item.name}</span> {/* Display folder name */}
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={selectedFiles.has(filePath)}
                  onChange={() => handleFileCheck(filePath)}
                  className="mr-2"
                />
                {/* File Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v7m0 0H5m7 0h7M5 11V5a2 2 0 012-2h5l4 4v4m-7 7h.01M19 11v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7m10 4h4"
                  />
                </svg>
                {item.name} {/* Display file name */}
              </>
            )}
          </div>
          {item.children && (
            <div style={{ marginLeft: "20px" }}>
              {renderTree(item.children, filePath)}{" "}
              {/* Render children for folders */}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col  p-10">
      <div className="flex flex-row">
        <div className="flex flex-col w-1/2 pr-2  justify-center">
          <div className="overflow-y-auto h-[80vh] ">{renderTree(files)}</div>
        </div>
        <div className="w-1/2 pl-2">
          <pre
            onClick={() => copyToClipboard(concatenated)}
            title="Click to copy"
            className=" text-xs cursor-pointer overflow-y-auto h-[80vh] bg-gray-800 text-white p-4 font-mono shadow-lg rounded-lg whitespace-pre-wrap  "
          >
            {concatenated}
          </pre>
          {copySuccess && (
            <div
              className="flex items-center justify-center text-green-500 mt-2 absolute top-0 right-0 bg-opacity-75"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              {copySuccess}
            </div>
          )}
        </div>
      </div>
      {tokenNum > 0 ? (
        <div
          className="flex justify-end text-right mt-1"
          style={{ height: "15px" }}
        >
          <p>Token Count: {tokenNum.toLocaleString()}</p>
        </div>
      ) : (
        <div
          className="flex justify-end text-right mt-1"
          style={{ height: "15px" }}
        ></div>
      )}
      <div className="flex flex-row">
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="mt-5 bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded w-full"
          style={{ height: "80px" }}
          placeholder="Enter custom text here..."
        />
        <button
          onClick={handleSubmit}
          className="mt-5 ml-5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          style={{ height: "80px", width: " 500px" }}
        >
          Output
        </button>
      </div>
    </div>
  );
}

export default FileTree;
