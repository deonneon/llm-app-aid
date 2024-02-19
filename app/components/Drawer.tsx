import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import PDFViewer2 from "./PDFViewer2";
import SystemUpdateAltOutlinedIcon from "@mui/icons-material/SystemUpdateAltOutlined";

// Assuming you have an array of creation items
const creations = [
  { id: 1, imageUrl: "", title: "Creation 1" },
  { id: 2, imageUrl: "", title: "Creation 2" },
  { id: 3, imageUrl: "", title: "Creation 1" },
  { id: 4, imageUrl: "", title: "Creation 2" },
  { id: 5, imageUrl: "", title: "Creation 1" },
  { id: 6, imageUrl: "", title: "Creation 2" },
  // Add more creations as needed
];

const CreationsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const [draftFiles, setDraftFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadDrafts = async () => {
      const files: File[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("draftPDF_")) {
          const dataURL = localStorage.getItem(key);
          if (dataURL) {
            // Convert dataURL to Blob
            const response = await fetch(dataURL);
            const blob = await response.blob();
            // Create a File from Blob
            const file = new File([blob], `Draft_${new Date().getTime()}.pdf`, {
              type: "application/pdf",
            });
            files.push(file);
          }
        }
      }
      setDraftFiles(files);
    };

    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const clearAllDrafts = () => {
    // Iterate over localStorage and remove items related to drafts
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("draftPDF_")) {
        localStorage.removeItem(key);
      }
    });

    // Clear the state to reflect the changes in the UI
    setDraftFiles([]);
  };

  return (
    <Drawer anchor="left" open={isOpen} onClose={onClose}>
      <Typography variant="h6" style={{ padding: theme.spacing(4) }}>
        Drawer full of Creations
      </Typography>
      <Grid
        container
        spacing={2}
        style={{
          padding: theme.spacing(4),
          width: matches ? "400px" : "auto",
        }}
      >
        {creations.map((creation) => (
          <Grid item xs={6} sm={4} key={creation.id}>
            <Card>
              {creation.imageUrl ? (
                <CardMedia
                  component="img"
                  height="120"
                  image={creation.imageUrl}
                  alt={creation.title}
                />
              ) : (
                <div style={{ height: "120px", backgroundColor: "grey" }}></div>
              )}
              {/* You can add more details about each creation here */}
            </Card>
          </Grid>
        ))}
      </Grid>
      <div>
        <Typography variant="h6" style={{ padding: theme.spacing(4) }}>
          Saved Drafts ({draftFiles.length})
        </Typography>
        {draftFiles.map((file, index) => (
          <div key={index} style={{ margin: "10px" }}>
            <PDFViewer2 file={file} isFullScreen={false} />
            <a
              href={URL.createObjectURL(file)}
              download={`Draft_${index + 1}.pdf`}
              style={{ textDecoration: "none" }}
              className="absolute -mt-10 ml-4 text-gray-700"
            >
              <SystemUpdateAltOutlinedIcon></SystemUpdateAltOutlinedIcon>
            </a>
          </div>
        ))}
      </div>
      {draftFiles.length > 0 && (
        <Button
          variant="outlined"
          color="primary"
          style={{
            margin: "16px",
            marginBottom: "30px",
            width: "calc(100% - 32px)",
          }}
          onClick={clearAllDrafts}
        >
          Clear All Drafts
        </Button>
      )}
    </Drawer>
  );
};

export default CreationsDrawer;
