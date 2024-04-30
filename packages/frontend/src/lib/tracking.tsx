/* eslint-disable -- I know what I'm doing, allegedly. */
import Dexie from "dexie";
import { useEffect } from "react";

declare global {
  interface Window {
    CONDITION: typeof CONDITION;
    experiment: Experiment;
    __remote_promise_table__: Record<number, unknown>;
    __add_promise__: <T>(maybeProm: Promise<T> | T) => void;
    __poll_promise__: <T>(id: number) => { value: T } | undefined;
  }
}


let promise_id_current = 0;
window.__remote_promise_table__ = {};
window.__add_promise__ = (maybe) => {
  const id = promise_id_current++;
  if (maybe instanceof Promise) {
    maybe.then((val) => window.__remote_promise_table__[id] = val);
  } else {
    window.__remote_promise_table__[id] = maybe;
  }

  return id;
}
window.__poll_promise__ = function <T>(id: number) {
  if (window.__remote_promise_table__.hasOwnProperty(id)) {
    const val = window.__remote_promise_table__[id];
    delete window.__remote_promise_table__[id];
    return { value: val as T };
  }

  return undefined;
}


const CURRENT_CONDITION = "$CURRENT_CONDITION";

interface ExperimentState {
  participant: string;
  data: Record<string, unknown[]>;
  [CURRENT_CONDITION]: string;
}

export interface Experiment {
  _: ExperimentState;
  participant: (this: Experiment, id: string) => Promise<void>;
  conditions: (
    this: Experiment,
    ...arr: string[]
  ) => Promise<void>;
  save: (this: Experiment) => Promise<ExperimentState | undefined>;
  currentStats: (this: Experiment) => Promise<unknown[]>;
  availableConditions(): [{ variable: { id: string; title: string }; variants: { id: string; title: string, apply: () => void }[] }];
  help: () => void;
}

const CONDITION = {
  TEXT: {
    CONTROL: "text:control",
    BIGGER: "text:bigger",
  },
  COLORS: {
    CONTROL: "colors:control",
    MORE_CONTRAST: "colors:more-contrast",
  },
} as const;

const db = new Dexie("user-logging");
db.version(1).stores({
  "user-logging": "++time,url,event,x,y",
});

const touch = {
  start: (e: TouchEvent) => {
    void db._allTables["user-logging"]
      .add({
        time: Date.now(),
        url: location.pathname,
        event: "touchstart",
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        target: (e.target as HTMLElement)?.innerText
      })
      .then(() => {
        // console.log({
        //   url: location.pathname,
        //   e: "touchstart",
        //   d: [...e.touches],
        // });
      });
  },
  move: (e: TouchEvent) => {
    void db._allTables["user-logging"]
      .add({
        time: Date.now(),
        url: location.pathname,
        event: "touchmove",
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      })
      .then(() => {
        console.log({
          url: location.pathname,
          e: "touchmove",
          d: [...e.touches],
        });
      });
  },
  end: (e: TouchEvent) => {
    void db._allTables["user-logging"]
      .add({
        time: Date.now(),
        url: location.pathname,
        event: "touchend",
        x: null,
        y: null,
        target: (e.target as HTMLElement)?.innerText
      })
      .then(() => {
        // console.log({
        //   url: location.pathname,
        //   e: "touchend",
        //   d: [...e.touches],
        // });
      });
  },
  click: (e: MouseEvent) => {
    void db._allTables["user-logging"]
      .add({
        time: Date.now(),
        url: location.pathname,
        event: "click",
        x: e.clientX,
        y: e.clientY,
        selected: (e.target as HTMLElement)?.innerText
      })
      .then(() => {
        // console.log({
        //   url: location.pathname,
        //   e: "click",
        //   d: { x: e.clientX, y: e.clientY },
        // });
      });
  },
};

export function Tracker() {
  const t = touch;

  useEffect(() => {
    document.addEventListener("touchstart", t.start);
    document.addEventListener("touchmove", t.move);
    document.addEventListener("touchend", t.end);
    document.addEventListener("click", t.click);
  }, []);

  return <></>;
}

const defaultState = () => ({
  participant: "id",
  data: {} as Record<string, unknown[]>,
  [CURRENT_CONDITION]: "-",
});

function fromStorage() {
  let participant: any = localStorage.getItem(`__TRACKING__.participant`);
  if (!participant) {
    return undefined;
  }

  participant = JSON.parse(participant);

  let data: any = localStorage.getItem("__TRACKING__.data");
  if (!data) {
    return undefined;
  }

  data = JSON.parse(data);

  let current: any = localStorage.getItem(`__TRACKING__.${CURRENT_CONDITION}`);

  current = current ? JSON.parse(current) : window.experiment.availableConditions()
    .map(({ variable: { id: variable }, variants: [{ id: variant }] }) => `${variable}:${variant}`)
    .join("-");

  return { participant, data, [CURRENT_CONDITION]: current };
}

function saveAll(obj: ExperimentState): ExperimentState {
  localStorage.setItem(`__TRACKING__.participant`, JSON.stringify(obj.participant));
  localStorage.setItem(`__TRACKING__.${CURRENT_CONDITION}`, JSON.stringify(obj[CURRENT_CONDITION]));
  localStorage.setItem(`__TRACKING__.data`, JSON.stringify(obj.data));
  return obj;
}

const state = new Proxy(
  fromStorage() ?? saveAll(defaultState() as any),
  {
    set(target, p: string, v, _) {
      localStorage.setItem(`__TRACKING__.${p.toString()}`, JSON.stringify(v));
      (target as any)[p] = v;
      return true;
    },
  },
);



window.experiment = {
  _: state,
  async participant(id) {
    if (id === this._.participant) return;
    await db._allTables["user-logging"].clear();
    localStorage.setItem(`__TRACKING__.data`, JSON.stringify({}));

    this._.participant = id;
  },

  async conditions(...conditions) {
    const state = this._;
    if (state) {
      if (state[CURRENT_CONDITION] !== undefined && state[CURRENT_CONDITION] !== "-") {
        const arr = await db._allTables["user-logging"].toArray();
        await db._allTables["user-logging"].clear();
        state.data = { ...state.data, [this._[CURRENT_CONDITION] as any]: arr };
      }

      state.data = {
        ...state.data,
        [conditions.join("-")]: [{ event: "__start__", time: Date.now() }],
      };

      state[CURRENT_CONDITION] = conditions.join("-");

      console.log("Applying ", conditions);

      conditions.map(cond => cond.split(":")).map(([v, variant]) => this.availableConditions().find(c => c.variable.id === v)?.variants.find(vv => vv.id === variant))
        .filter(a => a != undefined)
        .forEach(a => a!.apply());

      console.log("Set conditions:", conditions);
    } else {
      throw new Error("EXPERIMENT PARTICIPANT NOT SET!");
    }
  },

  async save() {
    if (this._) {
      if (this._[CURRENT_CONDITION] !== "-") {
        const arr = await db._allTables["user-logging"].toArray();
        await db._allTables["user-logging"].clear();
        this._.data = {
          ...this._.data,
          [this._[CURRENT_CONDITION] as any]: [...arr, { event: "__finish__", time: Date.now() }],
        };

        ///@ts-expect-error - Let me do this.
        delete this._[CURRENT_CONDITION];

        let tmp = JSON.parse(JSON.stringify(this._));

        const def = defaultState();

        this._.data = def.data;
        this._.participant = def.participant;
        this._[CURRENT_CONDITION] = def.participant;

        return tmp;
      }
    } else {
      console.warn("EXPERIMENT PARTICIPANT NOT SET!");
    }
  },

  help() {
    console.log(
      "%cExperiment",
      "color:purple;font-family:system-ui;font-size:4rem;font-weight:bold",
    );
    console.log(
      '%cexperiment%c.%cparticipant%c(%c"PARTICIPANT_ID"%c)',
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#65AFFF;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#4DA871;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
    );
    console.log("Start with a new participant.");

    console.log(
      "%cexperiment%c.%cconditions%c(%cCONDITION%c.%cCOLORS%c.%cCONTROL%c, %cCONDITION%c.%cTEXT%c.%cCONTROL%c)",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#65AFFF;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
    );

    console.log("Initiate a test with the given conditions.");

    console.log(
      "%cexperiment%c.%csave%c()",
      "color:#E36397;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
      "color:#65AFFF;font-size:1rem;",
      "color:#A4A4A4;font-size:1rem;",
    );
    console.log("Save a participant as JSON.");
  },

  async currentStats() {
    return await db._allTables["user-logging"].toArray();
  },

  availableConditions() {
    return [{
      variable: { id: "confirmation-al-avail", title: "Confirmation + Alt. Avail." },
      variants: [{
        id: "control", title: "Control", apply: () => {
          console.log("APPLIED CONTROL.")
          window.__CONFIRM_CANCEL__ = false;
          localStorage.setItem("__CONFIRM_CANCEL__", JSON.stringify(false));
          window.__CONFIRM_PROPOSAL__ = false;
          localStorage.setItem("__CONFIRM_PROPOSAL__", JSON.stringify(false));
          window.__SHOW_ALT_AVAIL__ = false;
          localStorage.setItem("__SHOW_ALT_AVAIL__", JSON.stringify(false));
        }
      }, {
        id: "active", title: "Active", apply: () => {
          console.log("APPLIED ACTIVE.")
          window.__CONFIRM_CANCEL__ = true;
          localStorage.setItem("__CONFIRM_CANCEL__", JSON.stringify(true));
          window.__CONFIRM_PROPOSAL__ = true;
          localStorage.setItem("__CONFIRM_PROPOSAL__", JSON.stringify(true));
          window.__SHOW_ALT_AVAIL__ = true;
          localStorage.setItem("__SHOW_ALT_AVAIL__", JSON.stringify(true));
        }
      }]
    }
    ];
  },
};

window.CONDITION = CONDITION;

///@ts-expect-error -- Because
window.exportLogging = async () => {
  const arr = await db._allTables["user-logging"].toArray();
  await db._allTables["user-logging"].clear();
  console.log(JSON.stringify(arr));
};
