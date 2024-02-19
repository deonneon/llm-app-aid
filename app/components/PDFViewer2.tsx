"use client";

import { useState, useEffect, useRef, FC } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { BarLoader } from "react-spinners";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewer2Props {
  file: any;
  isFullScreen: boolean;
}

const PDFViewer2: FC<PDFViewer2Props> = ({ file, isFullScreen }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    calculateScale();
  };

  const calculateScale = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const newScale = containerWidth / 595; // Adjust this divisor based on your content's natural size
    setScale(newScale);
  };

  // Recalculate scale on window resize
  useEffect(() => {
    const resizeListener = () => {
      calculateScale();
    };
    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  // Recalculate scale when numPages changes or on full screen toggle
  useEffect(() => {
    calculateScale();
  }, [numPages, isFullScreen]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        "& > :not(style)": {
          m: 1,
          width: "100%",
          height: "100%",
        },
      }}
    >
      <Paper elevation={3}>
        <div ref={containerRef}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center">
                {/* <BarLoader color="gray" /> */}
              </div>
            }
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                renderTextLayer={false}
                renderAnnotationLayer={false}
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                className={`h-full ${
                  numPages && numPages > 1
                    ? "mb-1 border-b-2 border-gray-300"
                    : ""
                }`}
                loading={
                  <div className="flex items-center justify-center">
                    {/* <BarLoader color="gray" /> */}
                  </div>
                }
              />
            ))}
          </Document>
        </div>
      </Paper>
    </Box>
  );
};

export default PDFViewer2;
