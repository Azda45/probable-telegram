import AppErrorView from "@/components/AppErrorView";

export default function Unauthorized() {
  return <AppErrorView code="401" />;
}
