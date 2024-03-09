"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { encode } from "gpt-tokenizer";

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function FileTree() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [concatenated, setConcatenated] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [customText, setCustomText] = useState("");
  const [tokenNum, setTokenNum] = useState(0);
  const [directoryPath, setDirectoryPath] = useState("app");
  const inputRef = useRef(null);

  const loadDirectory = () => {
    inputRef.current?.focus();
    setDirectoryPath("./set/project/path");
  };

  const fetchAndSetFiles = useCallback(() => {
    if (!directoryPath) return;

    fetch(`/api/files?dir=${encodeURIComponent(directoryPath)}`)
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        const allFiles = new Set();
        const collectFiles = (items, prefix = "") => {
          items.forEach((item) => {
            const filePath = prefix ? `${prefix}/${item.name}` : item.name;
            if (!item.children) {
              allFiles.add(filePath);
            } else {
              collectFiles(item.children, filePath);
            }
          });
        };
        collectFiles(data);
        setSelectedFiles(allFiles);
      })
      .catch((error) => console.error("Error loading directory:", error));
  }, [directoryPath]);

  useEffect(() => {
    const debouncedFetch = debounce(fetchAndSetFiles, 500);
    debouncedFetch();
  }, [fetchAndSetFiles]);

  useEffect(() => {
    fetchAndSetFiles();
  }, [fetchAndSetFiles]);

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
        fetch(
          `/api/content?file=${file}&dir=${encodeURIComponent(directoryPath)}`
        )
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Server responded with status ${res.status}`);
            }
            return res.text();
          })
          .then((content) => ({
            fileName: file,
            content: content
              .trim()
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .join("\n"),
          }))
          .catch((error) => {
            console.error(`Failed to fetch file content for ${file}:`, error);
            return {
              fileName: file,
              content: `Error: Failed to fetch content. ${error.message}`,
            };
          })
      )
    );

    const concatenatedText =
      contents
        .map(({ fileName, content }) => `File: ${fileName}\n${content}`)
        .join("\n\n") + `\n\n${customText}`;

    setConcatenated(concatenatedText);

    // Tokenize and count
    const tokens = encode(concatenatedText);
    const tokenCount = tokens.length;
    setTokenNum(tokenCount);
    console.log(`Token Count: ${tokenCount}`);
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
      const isChecked = selectedFiles.has(filePath);

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
                  checked={isChecked} // Bind checked state to whether file is selected
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
                {item.name}
              </>
            )}
          </div>
          {item.children && (
            <div style={{ marginLeft: "20px" }}>
              {item.children && renderTree(item.children, filePath)}
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
          <div className="flex flex-col h-[80vh] ">
            <div className="flex flex-row  mb-2">
              <button
                onClick={loadDirectory}
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold p-2 rounded mr-2"
                aria-label="Load Project Folder"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 002-2V7a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </button>
              <input
                ref={inputRef}
                type="text"
                value={directoryPath}
                onChange={(e) => {
                  const newPath = e.target.value;
                  setDirectoryPath(newPath);
                }}
                placeholder="Custom Directory path..."
                className="w-full px-3 py-2 bg-gray-900 text-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="overflow-y-auto ">{renderTree(files)}</div>
          </div>
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
