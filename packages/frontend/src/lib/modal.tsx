import type { ReactNode } from "react";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../components/button";

interface ModalChoice {
  id: string;
  label: string;
  type: "primary" | "other";
}

function ModalImpl<T extends ModalChoice[]>({
  children: desc,
  title,
  onExit,
  options,
}: {
  children: ReactNode;
  title: string;
  onExit: (b: T[number]) => void;
  options: T;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  setTimeout(() => ref.current?.showModal());
  return (
    <dialog
      ref={ref}
      className="z-50 backdrop:animate-burring backdrop:h-screen backdrop:w-screen p-4 rounded-md min-w-[66.6vw]"
    >
      <h2 className="text-xl">{title}</h2>
      <div className="p-2">{desc}</div>
      <footer className="grid grid-flow-col-dense auto-cols-fr gap-x-1">
        {options.map((op) => (
          <Button
            className={`p-1 ${
              op.type === "primary"
                ? ""
                : "bg-transparent border-2 text-black border-red-600"
            }`}
            onClick={() => {
              ref.current?.close();
              onExit(op);
            }}
            key={op.id}
          >
            {op.label}
          </Button>
        ))}
      </footer>
    </dialog>
  );
}
export namespace Modal {
  export function confirm<T extends ModalChoice[]>(
    options: T,
    description: string,
    title = "Are you sure?",
  ): Promise<T[number]["id"]> {
    const modalRoot = createRoot(
      document.querySelector("#modals") as unknown as HTMLDivElement,
    );
    return new Promise((res) => {
      modalRoot.render(
        <ModalImpl
          title={title}
          options={options}
          onExit={(op) => {
            res(op.id);
            modalRoot.unmount();
          }}
        >
          {description}
        </ModalImpl>,
      );
    });
  }
}
