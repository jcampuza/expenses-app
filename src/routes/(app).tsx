import { createEffect, Show, type ParentProps } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CurrentUserProvider } from "@/lib/current-user";
import { usePersistUser } from "@/lib/persist-user";

export default function AuthenticatedLayout(props: ParentProps) {
  const auth = usePersistUser();
  const navigate = useNavigate();

  createEffect(
    () => auth().status,
    (status) => {
      if (status === "signedOut") {
        queueMicrotask(() => navigate("/", { replace: true }));
      }
    },
  );

  return (
    <Show when={auth().status === "ready"}>
      <CurrentUserProvider>
        <div class="flex flex-col">
          <div class="flex min-h-screen flex-col">
            <Header />
            <div class="container relative mx-auto flex grow flex-col">
              {props.children}
            </div>
            <Footer />
          </div>
        </div>
      </CurrentUserProvider>
    </Show>
  );
}
