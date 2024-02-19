"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center">
        {/* <BarLoader color="gray" /> */}
      </div>
    ),
  },
);

const BlobProvider = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.BlobProvider),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center">
        {/* <BarLoader color="gray" /> */}
      </div>
    ),
  },
);

import { FC, useState, useEffect, useMemo } from "react";
import WorksheetPDF from "./WorksheetPDF";
import Image from "next/image";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import { IconButton } from "@mui/material";
import { BarLoader } from "react-spinners";
import Button from "@mui/material/Button";
import { Problem } from "../types/problem";
import PDFViewer2 from "./PDFViewer2";

const sampleMultipleChoice = "/multiple-choice.png";
const sampleTextPrompt = "/reading-response-questions-fiction.jpg";
const sampleFillBlank = "/fill-in-blank.png";

interface MainContentProps {
  currentStep: number;
  topic: string;
  numberOfProblems: number;
  problems: Problem[];
  rows: number;
  columns: number;
  borderVisible: boolean;
  showAnswers: boolean;
  backgroundImage: string;
  activeFormat: number;
  fontSize: number;
  fontType: string;
  isLoading: boolean;
  handlePdfBlobUrl: (url: string) => void;
  nameHeader: boolean;
  dateHeader: boolean;
}

const MainContent: FC<MainContentProps> = ({
  currentStep,
  topic,
  numberOfProblems,
  problems,
  rows,
  columns,
  borderVisible,
  showAnswers,
  backgroundImage,
  activeFormat,
  fontSize,
  fontType,
  isLoading,
  handlePdfBlobUrl,
  nameHeader,
  dateHeader,
}) => {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    setIsTransitioning(true); // Start transitioning
    const timer = setTimeout(() => setIsTransitioning(false), 200); // End transitioning after 300ms
    return () => clearTimeout(timer);
  }, [problems, backgroundImage]);

  let displayImage: string;
  switch (activeFormat) {
    case 0: // Assuming 0 is Text Responses
      displayImage = sampleTextPrompt;
      break;
    case 1: // Assuming 1 is Fill in the Blank
      displayImage = sampleFillBlank;
      break;
    case 2: // Assuming 2 is MC
      displayImage = sampleMultipleChoice;
      break;
    default:
      displayImage = sampleMultipleChoice; // Fallback to the default background image
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center">
          <BarLoader color="gray" />
        </div>
      );
    } else {
      return (
        <BlobProvider
          document={
            <WorksheetPDF
              problems={problems}
              rows={rows}
              columns={columns}
              backgroundImage={backgroundImage}
              borderVisible={borderVisible}
              showAnswers={showAnswers}
              fontSize={fontSize}
              fontType={fontType}
              nameHeader={nameHeader}
              dateHeader={dateHeader}
            />
          }
        >
          {({ blob, url, loading, error }) => {
            if (loading) {
              return (
                <div className="flex items-center justify-center">
                  <BarLoader color="gray" />
                </div>
              );
            }
            if (!loading && url) {
              handlePdfBlobUrl(url);
            }
            if (error) {
              return <div>Error generating document: {error.message}</div>;
            }
            return (
              <div className="h-full overflow-y-auto">
                <IconButton
                  onClick={toggleFullScreen}
                  className="font-white absolute right-5 top-3 opacity-50"
                  aria-label="toggle zoom"
                >
                  {isFullScreen ? <ZoomInMapIcon /> : <ZoomOutMapIcon />}
                </IconButton>
                <PDFViewer2 file={url} isFullScreen={isFullScreen} />
              </div>
            );
          }}
        </BlobProvider>
      );
    }
  };

  const [currentImage, setCurrentImage] = useState(displayImage);
  const [nextImage, setNextImage] = useState("");
  const [inTransition, setInTransition] = useState(false);

  // Hook to change image with a slide effect on activeFormat change
  useEffect(() => {
    // Set the new image as the next image and start transition
    setNextImage(displayImage);
    setInTransition(true);

    // Set a timeout for the duration of the transition
    const timeoutId = setTimeout(() => {
      // After the transition, set the next image as the current image
      setCurrentImage(displayImage);
      setNextImage("");
      setInTransition(false);
    }, 300); // Transition duration

    // Cleanup the timeout
    return () => clearTimeout(timeoutId);
  }, [activeFormat, displayImage]);

  // CSS classes for animation
  const currentImageClass = inTransition ? "slide-out" : "";
  const nextImageClass = inTransition ? "slide-in" : "";

  const mainContentClasses = `transition-all duration-500 ease-in-out pdf-container w-full h-full p-5 md:px-20 py-2 md:pt-14 ${
    isFullScreen
      ? "fixed top-0 left-0 z-[1000] cursor-zoom-out"
      : "cursor-zoom-in relative w-[99%] h-[99%]"
  } `;

  return (
    <>
      {currentStep < 2 && (
        <div className="overflow-hidden rounded-lg border-l-4 border-blue-300 bg-blue-50 p-6">
          <h4 className="mb-4 text-lg font-semibold md:text-left md:text-2xl">
            Create Engaging Worksheets with Ease
          </h4>
          <p className="text-md text-left leading-relaxed text-gray-800 md:text-lg">
            A dynamic tool designed to help educators create customized
            worksheets tailored to their curriculum needs. Input your topic and
            let our AI do the rest, generating high-quality, relevant questions
            that challenge and engage your students.
          </p>
          {/* make sure this doesn't render on mobile */}
          <div className="image-container hidden md:block">
            <div className={`image-animation ${currentImageClass}`}>
              <Image
                src={currentImage}
                alt="Current worksheet format"
                width={500}
                height={300}
                priority
                className="border shadow-lg"
              />
            </div>
            {nextImage && (
              <div className={`image-animation ${nextImageClass}`}>
                <Image
                  src={nextImage}
                  alt="Next worksheet format"
                  width={500}
                  height={300}
                  priority
                  className="border shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}
      {currentStep > 1 && (
        <div className={mainContentClasses} onClick={toggleFullScreen}>
          {/* {isFullScreen ? (
            <Button
              variant="outlined"
              className="absolute -mt-12 border-gray-400 text-black hover:bg-gray-400"
            >
            </Button>
          ) : (
            ""
          )} */}

          {renderContent()}
        </div>
      )}
    </>
  );
};

export default MainContent;
