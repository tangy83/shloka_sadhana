/**
 * GroupsScreen Tests
 * Tests for group list tabs, loading, invites badge, and actions
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { GroupsScreen } from "../GroupsScreen";
import { useGroupStore } from "@/stores/useGroupStore";

// Mock Colors — GroupsScreen uses Colors.dark.* which does not exist on the real Colors export
jest.mock("@/constants/Colors", () => ({
  Colors: {
    primary: "#E87E04",
    dark: {
      background: "#1a1a2e",
      card: "#16213e",
      text: "#E8D5B7",
      textSecondary: "rgba(232, 213, 183, 0.7)",
      border: "rgba(232, 213, 183, 0.1)",
    },
  },
}));

// Mock Layout — GroupsScreen uses Layout.typography.* / Layout.spacing.* / Layout.borderRadius.*
// which are separate exports on the real module (not nested under Layout).
jest.mock("@/constants/Layout", () => ({
  Layout: {
    window: { width: 375, height: 812 },
    borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: { h1: 34, h2: 28, h3: 24, body: 16, caption: 12 },
  },
  Spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  BorderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
}));

jest.mock("@/stores/useGroupStore");
const mockUseGroupStore = useGroupStore as jest.MockedFunction<typeof useGroupStore>;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_GROUP: any = {
  id: "group-1",
  name: "Morning Sadhana",
  description: "Daily practice",
  privacy: "public",
  adminIds: ["test-uid"],
  memberIds: ["test-uid"],
  memberCount: 5,
  stats: { totalPractices: 10, totalMinutes: 100 },
};

const MOCK_DISCOVERY_ITEM: any = {
  id: "disc-1",
  name: "Evening Yoga",
  description: "Evening sessions",
  memberCount: 8,
  stats: { totalPractices: 20, totalMinutes: 200 },
  isMember: false,
  hasPendingInvite: false,
};

const MOCK_INVITE: any = {
  id: "invite-1",
  groupId: "group-2",
  groupName: "Bhajans Circle",
  fromUserId: "user-99",
  fromUserName: "Ramesh",
  createdAt: "2026-02-10T10:00:00.000Z",
};

const navigation: any = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
};

// ── Store helper ──────────────────────────────────────────────────────────────

function setupStore(overrides: Record<string, any> = {}) {
  mockUseGroupStore.mockReturnValue({
    myGroups: [],
    myGroupsLoading: false,
    publicGroups: [],
    discoveryLoading: false,
    groupInvites: [],
    invitesLoading: false,
    groupStats: {
      totalGroups: 0,
      groupsAsAdmin: 0,
      groupsAsMember: 0,
      totalGroupPractices: 0,
      mostActiveGroup: null,
    },
    loadMyGroups: jest.fn(() => Promise.resolve()),
    loadGroupInvites: jest.fn(() => Promise.resolve()),
    loadPublicGroups: jest.fn(() => Promise.resolve()),
    joinGroup: jest.fn(() => Promise.resolve()),
    leaveGroup: jest.fn(() => Promise.resolve()),
    acceptInvite: jest.fn(() => Promise.resolve()),
    declineInvite: jest.fn(() => Promise.resolve()),
    createGroup: jest.fn(() => Promise.resolve()),
    ...overrides,
  } as any);
}

// ── Initial Render ────────────────────────────────────────────────────────────

describe("GroupsScreen — Initial Render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStore();
  });

  it("renders without crashing and shows all three tabs", async () => {
    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText("My Groups")).toBeTruthy();
      expect(getByText("Discover")).toBeTruthy();
      expect(getByText("Invites")).toBeTruthy();
    });
  });

  it("calls loadMyGroups, loadPublicGroups, and loadGroupInvites on mount", async () => {
    const loadMyGroups = jest.fn(() => Promise.resolve());
    const loadPublicGroups = jest.fn(() => Promise.resolve());
    const loadGroupInvites = jest.fn(() => Promise.resolve());
    setupStore({ loadMyGroups, loadPublicGroups, loadGroupInvites });

    render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(loadMyGroups).toHaveBeenCalled();
      expect(loadPublicGroups).toHaveBeenCalled();
      expect(loadGroupInvites).toHaveBeenCalled();
    });
  });

  it("shows empty-state when there are no groups", async () => {
    setupStore({ myGroups: [] });
    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText("No Groups Yet")).toBeTruthy();
    });
  });

  it("navigates to CreateGroup when the header + button is pressed", async () => {
    setupStore();
    const nav = { ...navigation, navigate: jest.fn() };
    const { getByLabelText } = render(
      <GroupsScreen navigation={nav} />
    );

    await waitFor(() => {
      expect(getByLabelText("Create new group")).toBeTruthy();
    });

    fireEvent.press(getByLabelText("Create new group"));
    expect(nav.navigate).toHaveBeenCalledWith("CreateGroup");
  });

  it("renders group cards when myGroups is populated", async () => {
    setupStore({ myGroups: [MOCK_GROUP] });
    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText("Morning Sadhana")).toBeTruthy();
      expect(getByText("Daily practice")).toBeTruthy();
    });
  });
});

// ── Tab Switching ─────────────────────────────────────────────────────────────

describe("GroupsScreen — Tab Switching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStore();
  });

  it("switches to Discover tab and shows discovery content", async () => {
    setupStore({ publicGroups: [MOCK_DISCOVERY_ITEM] });
    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => expect(getByText("Discover")).toBeTruthy());
    fireEvent.press(getByText("Discover"));

    await waitFor(() => {
      expect(getByText("Evening Yoga")).toBeTruthy();
    });
  });

  it("shows empty state on Discover tab when there are no public groups", async () => {
    setupStore({ publicGroups: [] });
    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    fireEvent.press(getByText("Discover"));

    await waitFor(() => {
      expect(getByText("No Public Groups")).toBeTruthy();
    });
  });

  it("switches to Invites tab and shows invite cards", async () => {
    setupStore({ groupInvites: [MOCK_INVITE] });
    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => expect(getByText("Invites")).toBeTruthy());
    fireEvent.press(getByText("Invites"));

    await waitFor(() => {
      expect(getByText("Bhajans Circle")).toBeTruthy();
      expect(getByText("Invited by Ramesh")).toBeTruthy();
    });
  });
});

// ── Invite Badge ──────────────────────────────────────────────────────────────

describe("GroupsScreen — Invite Badge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows numeric badge on Invites tab when there are pending invites", async () => {
    setupStore({ groupInvites: [MOCK_INVITE] });
    const { queryByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(queryByText("1")).toBeTruthy();
    });
  });

  it("does not show invite badge when groupInvites is empty", async () => {
    setupStore({ groupInvites: [] });
    const { queryByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(queryByText("0")).toBeNull();
    });
  });
});

// ── Invite Actions ────────────────────────────────────────────────────────────

describe("GroupsScreen — Invite Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls acceptInvite with the invite id when Accept is pressed", async () => {
    const acceptInvite = jest.fn(() => Promise.resolve());
    setupStore({ groupInvites: [MOCK_INVITE], acceptInvite });

    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => expect(getByText("Invites")).toBeTruthy());
    fireEvent.press(getByText("Invites"));

    await waitFor(() => expect(getByText("Accept")).toBeTruthy());
    fireEvent.press(getByText("Accept"));

    expect(acceptInvite).toHaveBeenCalledWith("invite-1");
  });

  it("calls declineInvite with the invite id when Decline is pressed", async () => {
    const declineInvite = jest.fn(() => Promise.resolve());
    setupStore({ groupInvites: [MOCK_INVITE], declineInvite });

    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => expect(getByText("Invites")).toBeTruthy());
    fireEvent.press(getByText("Invites"));

    await waitFor(() => expect(getByText("Decline")).toBeTruthy());
    fireEvent.press(getByText("Decline"));

    expect(declineInvite).toHaveBeenCalledWith("invite-1");
  });
});

// ── Discover — Join Group ─────────────────────────────────────────────────────

describe("GroupsScreen — Join Group", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls joinGroup when Join Group button is pressed on a discovery item", async () => {
    const joinGroup = jest.fn(() => Promise.resolve());
    setupStore({ publicGroups: [MOCK_DISCOVERY_ITEM], joinGroup });

    const { getByText } = render(<GroupsScreen navigation={navigation} />);

    await waitFor(() => expect(getByText("Discover")).toBeTruthy());
    fireEvent.press(getByText("Discover"));

    await waitFor(() => expect(getByText("Join Group")).toBeTruthy());
    fireEvent.press(getByText("Join Group"));

    expect(joinGroup).toHaveBeenCalledWith("disc-1");
  });
});
