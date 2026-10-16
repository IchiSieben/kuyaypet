import { lazy, Suspense, type ComponentType } from "react";
import { MotionConfig } from "framer-motion";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { DeviceFrame } from "@/shell/DeviceFrame";
import { AppLayout } from "@/shell/AppLayout";
import { RequireAuth } from "@/shell/RequireAuth";
import { isTabRoute, RouteFade } from "@/shell/RouteFade";
import { Splash } from "@/screens/Splash";
import { Login } from "@/screens/auth/Login";
import { Register } from "@/screens/auth/Register";
import { Discover } from "@/screens/Discover";

// Code-splitting by screen: the first paint only needs the splash, auth and the deck.
const lazyNamed = <K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  name: K,
) => lazy(() => load().then((m) => ({ default: m[name] })));
const Recover = lazyNamed(() => import("@/screens/auth/Recover"), "Recover");
const Onboarding = lazyNamed(
  () => import("@/screens/Onboarding"),
  "Onboarding",
);
const Browse = lazyNamed(() => import("@/screens/Browse"), "Browse");
const Matches = lazyNamed(() => import("@/screens/Matches"), "Matches");
const PetProfile = lazyNamed(
  () => import("@/screens/PetProfile"),
  "PetProfile",
);
const ChatList = lazyNamed(() => import("@/screens/chat/ChatList"), "ChatList");
const ChatThreadScreen = lazyNamed(
  () => import("@/screens/chat/ChatThread"),
  "ChatThreadScreen",
);
const Coordinate = lazyNamed(
  () => import("@/screens/Coordinate"),
  "Coordinate",
);
const Profile = lazyNamed(() => import("@/screens/Profile"), "Profile");
const Favorites = lazyNamed(() => import("@/screens/Favorites"), "Favorites");
const History = lazyNamed(() => import("@/screens/History"), "History");
const Guide = lazyNamed(() => import("@/screens/Guide"), "Guide");
const Notifications = lazyNamed(
  () => import("@/screens/Notifications"),
  "Notifications",
);
const Credits = lazyNamed(() => import("@/screens/Credits"), "Credits");
const OwnerHome = lazyNamed(
  () => import("@/screens/owner/OwnerHome"),
  "OwnerHome",
);
const AdminShell = lazyNamed(
  () => import("@/screens/admin/AdminShell"),
  "AdminShell",
);
const AdminDashboard = lazyNamed(
  () => import("@/screens/admin/AdminDashboard"),
  "AdminDashboard",
);
const AdminUsers = lazyNamed(
  () => import("@/screens/admin/AdminUsers"),
  "AdminUsers",
);
const AdminUserDetail = lazyNamed(
  () => import("@/screens/admin/AdminUserDetail"),
  "AdminUserDetail",
);
const AdminPublications = lazyNamed(
  () => import("@/screens/admin/AdminPublications"),
  "AdminPublications",
);
const AdminPublicationDetail = lazyNamed(
  () => import("@/screens/admin/AdminPublicationDetail"),
  "AdminPublicationDetail",
);
const AdminReports = lazyNamed(
  () => import("@/screens/admin/AdminReports"),
  "AdminReports",
);
const AdminReportDetail = lazyNamed(
  () => import("@/screens/admin/AdminReportDetail"),
  "AdminReportDetail",
);
const NewPet = lazyNamed(() => import("@/screens/owner/NewPet"), "NewPet");
const EditPet = lazyNamed(() => import("@/screens/owner/EditPet"), "EditPet");
const Historias = lazyNamed(() => import("@/screens/Historias"), "Historias");
const Sprints = lazyNamed(() => import("@/screens/Sprints"), "Sprints");
const AdopterProfileView = lazyNamed(
  () => import("@/screens/AdopterProfileView"),
  "AdopterProfileView",
);

/** Route-chunk fallback: the shape of a screen (title, filter row, two cards), never a lone spinner. */
function Loading() {
  return (
    <div className="h-full px-4 pt-6" role="status" aria-label="Cargando">
      <div className="skeleton h-8 w-2/3 rounded-xl" />
      <div className="skeleton mt-3 h-4 w-1/2 rounded-lg" />
      <div className="mt-6 flex gap-2">
        <div className="skeleton h-9 w-20 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-16 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton aspect-[3/4] rounded-3xl" />
        <div className="skeleton aspect-[3/4] rounded-3xl" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    // v7_startTransition: navigations render in a transition, so React keeps the current screen
    // while a lazy chunk loads and swaps both in one commit (what layoutId needs: card -> profile).
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <MotionConfig reducedMotion="user">
        <DeviceFrame>
          <Suspense fallback={<Loading />}>
            <AppRoutes />
          </Suspense>
        </DeviceFrame>
      </MotionConfig>
    </HashRouter>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  // Tab screens fade inside AppLayout; everything else fades here. The pet profile enters as a
  // shared element from its card, so it skips the fade.
  return (
    <RouteFade
      key={isTabRoute(pathname) ? "tabs" : pathname}
      skip={pathname.startsWith("/mascota/")}
    >
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<Recover />} />
        <Route path="/creditos" element={<Credits />} />
        <Route path="/guia" element={<Guide />} />
        <Route path="/historias" element={<Historias />} />
        <Route path="/sprints" element={<Sprints />} />
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/mascota/:id" element={<PetProfile />} />
          <Route path="/chats/:id" element={<ChatThreadScreen />} />
          <Route path="/coordinar/:petId" element={<Coordinate />} />
          <Route path="/responsable/nueva" element={<NewPet />} />
          <Route path="/responsable/editar/:id" element={<EditPet />} />
          <Route path="/adoptante/:id" element={<AdopterProfileView />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/historial" element={<History />} />
          <Route element={<AppLayout />}>
            <Route path="/descubrir" element={<Discover />} />
            <Route path="/buscar" element={<Browse />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/notificaciones" element={<Notifications />} />
            <Route path="/responsable" element={<OwnerHome />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="usuarios/:id" element={<AdminUserDetail />} />
              <Route path="publicaciones" element={<AdminPublications />} />
              <Route
                path="publicaciones/:id"
                element={<AdminPublicationDetail />}
              />
              <Route path="reportes" element={<AdminReports />} />
              <Route path="reportes/:id" element={<AdminReportDetail />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteFade>
  );
}
