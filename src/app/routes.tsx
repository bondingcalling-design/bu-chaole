import { createBrowserRouter } from "react-router";
import ListenPage from "./pages/ListenPage";
import ListenChatPage from "./pages/ListenChatPage";
import ListenVoicePage from "./pages/ListenVoicePage";
import ReviewPage from "./pages/ReviewPage";
import ConversationReportPage from "./pages/ConversationReportPage";
import LoadingTransitionPage from "./pages/LoadingTransitionPage";
import TreehousePage from "./pages/TreehousePage";
import ProfilePage from "./pages/ProfilePage";
import VipPage from "./pages/VipPage";
import SettingsPage from "./pages/SettingsPage";
import BreathePage from "./pages/BreathePage";
import HistoryPage from "./pages/HistoryPage";
import HelpPage from "./pages/HelpPage";
import CheckinPage from "./pages/CheckinPage";
import ApiErrorPage from "./pages/ApiErrorPage";
import ExportReportPage from "./pages/ExportReportPage";

export const router = createBrowserRouter([
  { path: "/", Component: ListenPage },
  { path: "/listen-chat", Component: ListenChatPage },
  { path: "/listen-voice", Component: ListenVoicePage },
  { path: "/review", Component: ReviewPage },
  { path: "/review/loading", Component: LoadingTransitionPage },
  { path: "/review/report", Component: ConversationReportPage },
  { path: "/review/history", Component: HistoryPage },
  { path: "/treehouse", Component: TreehousePage },
  { path: "/breathe", Component: BreathePage },
  { path: "/profile", Component: ProfilePage },
  { path: "/profile/vip", Component: VipPage },
  { path: "/profile/settings", Component: SettingsPage },
  { path: "/profile/export", Component: ExportReportPage },
  { path: "/help", Component: HelpPage },
  { path: "/checkin", Component: CheckinPage },
  { path: "/error/api", Component: ApiErrorPage },
]);