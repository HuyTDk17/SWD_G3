import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Alert
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import HomeIcon from "@mui/icons-material/Home";
import { verifyCertificate } from "../api/certificateApi";

function VerifyCertificatePage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkVerify = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await verifyCertificate(code);
        setCert(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Invalid verification code. This certificate record does not exist or has been revoked.");
      } finally {
        setLoading(false);
      }
    };
    if (code) {
      checkVerify();
    }
  }, [code]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Checking certificate record authenticity...</Typography>
      </Container>
    );
  }

  if (error || !cert) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", bgcolor: "#ffebee", p: 6, borderRadius: 4 }}>
          <WorkspacePremiumIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h4" color="error" sx={{ fontWeight: 800, mb: 2 }}>
            Verification Failed
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {error}
          </Typography>
          <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate("/")}>
            Back to Portal Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Action panel (Hidden on Print!) */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, "@media print": { display: "none" } }}>
        <Button variant="text" startIcon={<HomeIcon />} onClick={() => navigate("/")}>
          Home Portal
        </Button>
        <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print Certificate
        </Button>
      </Box>

      {/* Main Verified Badge */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "#e8f5e9",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "success.light",
          display: "flex",
          alignItems: "center",
          gap: 2,
          "@media print": { display: "none" }
        }}
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6" color="success.dark" sx={{ fontWeight: 800 }}>
            Officially Verified Qualification
          </Typography>
          <Typography variant="caption" color="success.dark">
            This qualification is authentic and verified on the Language Learning platform database under UUID: {cert.verificationCode}
          </Typography>
        </Box>
      </Paper>

      {/* Certificate Frame/Layout (Stunning Printable Design!) */}
      <Paper
        elevation={4}
        sx={{
          p: 8,
          borderRadius: 4,
          border: "15px double #d4af37",
          textAlign: "center",
          background: "linear-gradient(to right, #fcfcfc, #f5f5f5, #fcfcfc)",
          position: "relative",
          boxShadow: 3
        }}
      >
        <WorkspacePremiumIcon sx={{ fontSize: 80, color: "#d4af37", mb: 2 }} />

        <Typography variant="h3" component="h1" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, mb: 1, color: "#1c2331" }}>
          Certificate of Completion
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: "italic", mb: 6 }}>
          This certifies that
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 800, borderBottom: "2px solid #eaeaea", pb: 1, display: "inline-block", px: 4, mb: 3, color: "primary.main" }}>
          {cert.studentId?.fullName || cert.studentId?.name || "Student"}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: "italic", mb: 4, maxWidth: 500, mx: "auto" }}>
          has successfully fulfilled all requirements, attended all lessons, and passed all curriculum assessments for
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {cert.courseId?.title}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 6 }}>
          Language Level: {cert.courseId?.language} ({cert.courseId?.cefrLevel})
        </Typography>

        <Divider sx={{ my: 4, mx: 12 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", px: 8 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {new Date(cert.issuedAt).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Date Issued
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {cert.verificationCode}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verification UUID
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default VerifyCertificatePage;
