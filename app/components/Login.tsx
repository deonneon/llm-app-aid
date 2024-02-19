import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const LoginDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: matches ? 454 : "auto" }} className="p-12">
        <Typography variant="h6" className="mb-4">
          Login
        </Typography>
        <form className="flex flex-col gap-4">
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            className="bg-gray-50"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            className="bg-gray-50"
          />
          <Button variant="contained" color="primary" className="mt-4 bg-black">
            Sign In
          </Button>
        </form>
      </Box>
    </Drawer>
  );
};

export default LoginDrawer;
