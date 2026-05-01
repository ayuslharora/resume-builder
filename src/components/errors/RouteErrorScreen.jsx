import { useRouteError } from "react-router-dom";
import AppErrorScreen from "./AppErrorScreen";

export default function RouteErrorScreen() {
  const error = useRouteError();

  return <AppErrorScreen error={error} />;
}
