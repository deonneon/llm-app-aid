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
  const [savedDirectories, setSavedDirectories] = useState([]);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [selectedExtensions, setSelectedExtensions] = useState(new Set());
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load from localStorage once when the component mounts
      const loadSavedDirectories =
        window.localStorage.getItem("savedDirectories");
      if (loadSavedDirectories) {
        setSavedDirectories(JSON.parse(loadSavedDirectories));
      }
      console.log("localStorage is available in this environment.");
    } else {
      console.log("localStorage is not available in this environment.");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Save to localStorage whenever savedDirectories changes
      window.localStorage.setItem(
        "savedDirectories",
        JSON.stringify(savedDirectories)
      );
      console.log("localStorage is available in this environment.");
    } else {
      console.log("localStorage is not available in this environment.");
    }
  }, [savedDirectories]);

  const loadDirectory = () => {
    inputRef.current?.focus();
    setDirectoryPath("./set/project/path");
  };

  const handleDirectoryChange = (e) => {
    const newPath = e.target.value;
    setDirectoryPath(newPath);
    setSavedDirectories((prevDirectories) => {
      if (!prevDirectories.includes(newPath)) {
        return [...prevDirectories, newPath];
      }
      return prevDirectories;
    });
  };

  const handleDirectorySelect = (e) => {
    const newPath = e.target.value;
    if (newPath === "clear") {
      setSavedDirectories([]);
      localStorage.removeItem("savedDirectories");
    } else {
      setDirectoryPath(newPath);
    }
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
    // Generate file tree string
    const fileTreeString = generateFileTreeString(files);

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
      `File Tree:\n${fileTreeString}\n` +
      contents
        .map(({ fileName, content }) => `File: ${fileName}\n${content}`)
        .join("\n\n") +
      `\n\n${customText}`;

    setConcatenated(concatenatedText);

    // Tokenize and count
    const tokens = encode(concatenatedText);
    const tokenCount = tokens.length;
    setTokenNum(tokenCount);
    console.log(`Token Count: ${tokenCount}`);
  };

  const isAllSelected = () => {
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
    collectFiles(files);
    for (let file of allFiles) {
      if (!selectedFiles.has(file)) {
        return false; // If any file is not selected, return false
      }
    }
    return allFiles.size > 0; // Return true if all files are selected and there are files
  };

  // Function to toggle the selection of all files
  const toggleSelectAll = (event) => {
    const { checked } = event.target;
    if (checked) {
      // If checkbox is checked, select all files
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
      collectFiles(files);
      setSelectedFiles(allFiles);
    } else {
      // If checkbox is unchecked, deselect all files
      setSelectedFiles(new Set());
    }
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

  const generateFileTreeString = (items, prefix = "") => {
    let result = "";
    items.forEach((item, index) => {
      const filePath = prefix ? `${prefix}/${item.name}` : item.name;
      result += `${filePath}\n`;
      if (item.children) {
        result += generateFileTreeString(item.children, filePath);
      }
    });
    console.log("file tree results:", result);
    return result;
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setFilterDropdownVisible(false);
      }
    };

    if (filterDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterDropdownVisible]);

  const handleExtensionSelection = (extension) => {
    setSelectedExtensions((prevSelectedExtensions) => {
      const newSelectedExtensions = new Set(prevSelectedExtensions);
      if (newSelectedExtensions.has(extension)) {
        newSelectedExtensions.delete(extension);
      } else {
        newSelectedExtensions.add(extension);
      }
      return newSelectedExtensions;
    });
  };

  const isExtensionSelected = (extension) => {
    return selectedExtensions.size === 0 || selectedExtensions.has(extension);
  };

  const getExtension = (fileName) => {
    return fileName.split(".").pop();
  };

  const renderTree = (items, prefix = "") => {
    return items.map((item, index) => {
      const filePath = prefix ? `${prefix}/${item.name}` : item.name;
      const isChecked = selectedFiles.has(filePath);
      const extension = item.children ? null : getExtension(item.name);

      if (!isExtensionSelected(extension)) {
        return null;
      }

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
    <div className="flex flex-col p-10">
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
                onChange={handleDirectoryChange}
                placeholder="Custom Directory path..."
                className="w-full px-3 py-2 bg-gray-900 text-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              {/* Dropdown for selecting saved directories */}
              <select
                onChange={handleDirectorySelect}
                value={directoryPath}
                className="w-7 p-2 -ml-2 bg-gray-900 text-white rounded "
              >
                {savedDirectories.map((dir, index) => (
                  <option key={index} value={dir}>
                    {dir}
                  </option>
                ))}
                <option value="clear">Clear Saved Directories</option>
              </select>
            </div>
            <div className="flex flex-row justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={toggleSelectAll}
                  className="form-checkbox accent-orange-400"
                />
                <span className="ml-2">...</span>
              </label>
              <svg
                onClick={toggleFilterDropdown}
                className="fill-current text-orange-400 h-4 w-4 ml-2 mt-1 cursor-pointer border-b border-orange-400 border-dashed"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M10,2A1,1,0,0,0,9,3V21a1,1,0,0,0,2,0V3A1,1,0,0,0,10,2Zm4,8a1,1,0,0,0-1,1v8a1,1,0,0,0,2,0V11A1,1,0,0,0,14,10Zm-8,4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V15A1,1,0,0,0,6,14Z" />
              </svg>
              {filterDropdownVisible && (
                <div
                  ref={filterDropdownRef}
                  className="absolute bg-gray-700 shadow-md p-2 top-30 left-72"
                >
                  {[
                    "filter doesn't work rn",
                    "js",
                    "jsx",
                    "ts",
                    "tsx",
                    "css",
                    "html",
                  ].map((ext) => (
                    <div key={ext} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isExtensionSelected(ext)}
                        onChange={() => handleExtensionSelection(ext)}
                        className="form-checkbox accent-orange-400 mr-2"
                      />
                      <label>{ext.toUpperCase()}</label>
                    </div>
                  ))}
                </div>
              )}
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
        <div className="flex justify-end text-right mt-2 h-2 text-sm">
          <p>Token Count: {tokenNum.toLocaleString()}</p>
        </div>
      ) : (
        <div className="flex justify-end text-right mt-2 h-2 text-sm"></div>
      )}
      <div className="flex flex-row">
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="mt-5 bg-gray-200 hover:bg-gray-100 text-black py-2 px-4 text-sm text-bold rounded w-full"
          style={{ height: "60px" }}
          placeholder="Enter custom text here...   Example: I am creating a React App for worksheet generation. The goal is to create a worksheet with practice problems for students to use. These are all the scripts for my React App."
        />
        <button
          onClick={handleSubmit}
          className="mt-5 ml-5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          style={{ height: "60px", width: " 500px" }}
        >
          Output
        </button>
      </div>
    </div>
  );
}

export default FileTree;
