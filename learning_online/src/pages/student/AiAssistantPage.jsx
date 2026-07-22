import { useEffect, useState, useRef } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import { getAiQuota, getAiSessions, createAiSession, getAiSession, sendAiMessage } from "../../api/aiApi";

function AiAssistantPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [quota, setQuota] = useState(null);

  const [newTargetLang, setNewTargetLang] = useState("English");
  const [newType, setNewType] = useState("conversation");

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);

  const handleSelectSession = async (id) => {
    try {
      setLoadingMessages(true);
      const res = await getAiSession(id);
      const session = res.data.data;
      setActiveSession(session);
      // Filter out system prompts for user display comfort
      setMessages(session.messages.filter(m => m.role !== "system"));
    } catch (err) {
      console.error(err);
      alert("Failed to load session message history.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadQuotaAndSessions = async () => {
    try {
      setLoadingSessions(true);
      setError(null);
      const [quotaRes, sessionsRes] = await Promise.all([getAiQuota(), getAiSessions()]);
      setQuota(quotaRes.data.data);
      const list = sessionsRes.data.data || [];
      setSessions(list);
      if (list.length > 0) {
        handleSelectSession(list[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load AI Assistant panel details.");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadQuotaAndSessions());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateSession = async () => {
    try {
      setError(null);
      const res = await createAiSession(newType, newTargetLang);
      const newSession = res.data.data;
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setMessages(newSession.messages.filter(m => m.role !== "system"));
      alert("New AI Language Session created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create session: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession || sending) return;

    const userMsg = input.trim();
    setInput("");
    setSending(true);

    // Optimistically update UI
    setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);

    try {
      const res = await sendAiMessage(activeSession._id, userMsg);
      const reply = res.data.data.response;
      setMessages(prev => [...prev, { role: "model", content: reply, timestamp: new Date() }]);
      
      // Update remaining quota counts
      setQuota(prev => ({
        ...prev,
        quotaUsed: (prev.quotaUsed || 0) + 1,
        quotaRemaining: res.data.data.quotaRemaining
      }));
    } catch (err) {
      console.error(err);
      alert("AI Assistant error: " + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  if (loadingSessions) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading AI Assistant Workspace...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Upper Quota Badge Indicators */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          AI Language Assistant
        </Typography>
        {quota && (
          <Chip
            label={`Quota Remaining: ${quota.quotaRemaining} / ${quota.quotaLimit} messages`}
            color={quota.quotaRemaining > 10 ? "primary" : "warning"}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ height: "70vh" }}>
        {/* Left Sidebar - Session Controls */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Start New Practice Session
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Language</InputLabel>
                <Select value={newTargetLang} label="Language" onChange={(e) => setNewTargetLang(e.target.value)}>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="French">French</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                  <MenuItem value="Vietnamese">Vietnamese</MenuItem>
                  <MenuItem value="Chinese">Chinese</MenuItem>
                  <MenuItem value="Japanese">Japanese</MenuItem>
                  <MenuItem value="Korean">Korean</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Focus</InputLabel>
                <Select value={newType} label="Focus" onChange={(e) => setNewType(e.target.value)}>
                  <MenuItem value="conversation">Free Conversation</MenuItem>
                  <MenuItem value="grammar">Grammar Corrections</MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSession} fullWidth>
                Start Practice Session
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ flexGrow: 1, overflowY: "auto", p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Practice History
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {sessions.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No past sessions. Create one above!
              </Typography>
            ) : (
              <List>
                {sessions.map((s) => (
                  <ListItem key={s._id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeSession?._id === s._id}
                      onClick={() => handleSelectSession(s._id)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemText
                        primary={`${s.targetLanguage} - ${s.type === 'grammar' ? 'Grammar' : 'Conv'}`}
                        secondary={new Date(s.createdAt).toLocaleDateString()}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right main panel - Chat Window */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2, borderRadius: 3, overflow: "hidden" }}>
            {activeSession ? (
              <>
                <Box sx={{ borderBottom: "1px solid #eaeaea", pb: 1.5, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Active Practicing Session
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target Language: <strong>{activeSession.targetLanguage}</strong> | Focus: <strong>{activeSession.type}</strong>
                  </Typography>
                </Box>

                {/* Dialog Messages Feed */}
                <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1, mb: 2 }}>
                  {loadingMessages ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {messages.map((m, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            justifyContent: m.role === "user" ? "flex-end" : "flex-start"
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              maxWidth: "70%",
                              bgcolor: m.role === "user" ? "primary.main" : "grey.200",
                              color: m.role === "user" ? "white" : "text.primary"
                            }}
                          >
                            <Typography variant="body2">{m.content}</Typography>
                          </Box>
                        </Box>
                      ))}
                      <div ref={chatEndRef} />
                    </Box>
                  )}
                </Box>

                {/* Send chat text field form */}
                <Box component="form" onSubmit={handleSend} sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    placeholder="Type your message in target language..."
                    fullWidth
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" variant="contained" disabled={sending || !input.trim()} startIcon={<SendIcon />}>
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ m: "auto", textAlign: "center" }}>
                <ChatIcon sx={{ fontSize: 60, color: "grey.300", mb: 2 }} />
                <Typography color="text.secondary">
                  Create or select a practice session from the sidebar to chat with Gemini.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AiAssistantPage;
