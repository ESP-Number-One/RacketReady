import type {
  Availability,
  SportInfo,
  UserCreation,
} from "@esp-group-one/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";
import { useCallback, useContext, useRef, useState } from "react";
import moment from "moment";
import { API } from "../state/auth";
import { SportsAddMenu } from "../components/sports_add_menu";
import { ProfilePicturePicker } from "../components/form/profile_picture";
import { Input } from "../components/form/input";
import { Form } from "../components/form";
import { Button } from "../components/button";
import { useViewNav } from "../state/nav";
import { ProgressBar } from "../components/progress_bar";
import { useAsync } from "../lib/async";
import { SetAvailabilityBody } from "./me/availability";
import type { AvailabilityCreator } from "./me/availability";

interface PhaseProps {
  nextPhase: () => void;
  progress: ReactNode;
  submitText: string;
}

function PhaseOne({ nextPhase, progress, submitText }: PhaseProps) {
  const api = useContext(API);

  const [user, setUser] = useState<UserCreation>({
    name: "",
    email: "",
    profilePicture: "",
    description: "",
  });

  const onSubmit = useCallback(async () => {
    if (!user.name || !user.email || !user.description || !user.profilePicture)
      throw new Error("Required fields weren't filled in");

    await api.user().create(user);
    nextPhase();
  }, [user]);

  return (
    <Form onSubmit={onSubmit} submitText={submitText}>
      <Form.Header>Create an account</Form.Header>
      <Form.Body>
        {progress}

        <ProfilePicturePicker
          onChange={(profilePicture) => {
            setUser({ ...user, profilePicture });
          }}
          required
        />

        <Input
          type="text"
          icon={<FontAwesomeIcon icon={faUser} />}
          placeholder="Name"
          value={user.name}
          required
          onChange={(name) => {
            setUser({ ...user, name });
          }}
        />

        <Input
          type="email"
          icon={<FontAwesomeIcon icon={faEnvelope} />}
          placeholder="Email"
          value={user.email}
          required
          onChange={(email) => {
            setUser({ ...user, email });
          }}
        />

        <Input
          type="textarea"
          placeholder="Description"
          value={user.description}
          required
          onChange={(description) => {
            setUser({ ...user, description });
          }}
        />
      </Form.Body>
    </Form>
  );
}

function PhaseTwo({ nextPhase, progress, submitText }: PhaseProps) {
  const api = useContext(API);
  const [sports, setSports] = useState<SportInfo[]>([]);

  const onSubmit = useCallback(async () => {
    if (sports.length === 0)
      throw new Error("You must have picked at least one sport!");

    await api.user().addSports(...sports);
    nextPhase();
  }, [sports]);

  return (
    <Form onSubmit={onSubmit} submitText={submitText}>
      <Form.Header>Create an account</Form.Header>
      <Form.Body>
        {progress}
        <SportsAddMenu sports={sports} setSports={setSports} />
      </Form.Body>
    </Form>
  );
}

function PhaseThree({ nextPhase, progress, submitText }: PhaseProps) {
  const api = useContext(API);

  const [allowProgression, setAllowProgression] = useState(false);
  const [info, setInfo] = useState<AvailabilityCreator>({
    date: __SHOW_ALT_AVAIL__ ? [] : [""],
    start: "",
    end: "",
    recurring: undefined,
    recurringUnit: undefined,
  });
  const refresh = useRef<(() => void) | undefined>();

  const onSubmit = useCallback(async () => {
    const { date, start, end, recurring, recurringUnit } = info;

    if (!date || !start || !end)
      throw Error("Required fields were not filled in");

    const req: Availability = {
      timeStart: moment(`${date} ${start}`).toISOString(),
      timeEnd: moment(`${date} ${end}`).toISOString(),
    };

    if (recurring) {
      if (!recurring || !recurringUnit)
        throw Error("Required fields were not filled in");
      req.recurring = {};
      req.recurring[recurringUnit as "days" | "weeks" | "months" | "years"] =
        recurring;
    }

    await api.user().addAvailability(req);
    if (refresh.current) refresh.current();

    setInfo({
      date: __SHOW_ALT_AVAIL__ ? [] : [""],
      start: "",
      end: "",
      recurring: undefined,
      recurringUnit: undefined,
    });
    setAllowProgression(true);
  }, [api, info]);

  return (
    <Form onSubmit={onSubmit}>
      <Form.Header>Create an account</Form.Header>
      <Form.Body>
        {progress}
        <div className="mt-2">
          <SetAvailabilityBody
            info={info}
            setInfo={setInfo}
            refresh={refresh}
          />
        </div>
      </Form.Body>
      <Form.Footer padding>
        <div className="flex gap-2">
          <Button
            type="submit"
            backgroundColor={allowProgression ? "bg-p-grey-200" : undefined}
          >
            Add
          </Button>
          {allowProgression && (
            <Button onClick={nextPhase}>{submitText}</Button>
          )}
        </div>
      </Form.Footer>
    </Form>
  );
}

export function SignUp() {
  const viewNav = useViewNav();
  const api = useContext(API);
  const [phase, setPhase] = useState(0);

  // If the current user already has an account we can skip to the second
  // phase
  const { loading } = useAsync(async () => {
    const user = await api.user().me();
    setPhase(user.sports.length > 0 ? 2 : 1);

    return {};
  })
    .catch((err) => <>{err.message}</>)
    .await();

  const phases: {
    page: (n: PhaseProps) => ReactNode;
    name: string;
    submitText: string;
  }[] = [
    {
      page: PhaseOne,
      name: "General",
      submitText: "Ready!",
    },
    {
      page: PhaseTwo,
      name: "Sports",
      submitText: "Set!",
    },
    {
      page: PhaseThree,
      name: "Availability",
      submitText: "Go!",
    },
  ];

  const nextPhase = useCallback(() => {
    if (phase === phases.length - 1) {
      viewNav("/");
    } else {
      setPhase(phase + 1);
    }
  }, [phase, setPhase]);

  if (loading) return loading;

  const progress = (
    <ProgressBar currentIndex={phase} pageNames={phases.map((p) => p.name)} />
  );

  const phaseInfo = phases[phase];

  return (
    <phaseInfo.page
      nextPhase={nextPhase}
      progress={progress}
      submitText={phaseInfo.submitText}
    />
  );
}
