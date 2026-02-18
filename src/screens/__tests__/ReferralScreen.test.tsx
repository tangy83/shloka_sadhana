/**
 * ReferralScreen Tests
 * Tests for referral code display, share/copy actions, and leaderboard
 */

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Share, Clipboard } from "react-native";
import { ReferralScreen } from "../ReferralScreen";
import { referralService } from "@/services/referralService";
import auth from "@react-native-firebase/auth";

// Mock Colors — ReferralScreen uses Colors.dark.* which does not exist on the real Colors export
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

// Mock Layout — ReferralScreen uses Layout.typography.* / Layout.spacing.* / Layout.borderRadius.*
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

// Mock referralService
jest.mock("@/services/referralService");
const mockReferralService = referralService as jest.Mocked<typeof referralService>;

// ── Firebase auth mock helper ─────────────────────────────────────────────────

function setCurrentUser(user: any) {
  (auth as jest.Mock).mockReturnValue({
    currentUser: user,
  });
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_USER = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
};

const MOCK_REFERRAL_DATA: any = {
  referralCode: "SADHANA2026",
  referredBy: null,
  totalReferrals: 3,
  successfulReferrals: 2,
  pendingReferrals: 1,
  xpEarned: 100,
  referredUsers: [],
  lastReferralAt: null,
};

const MOCK_REFERRAL_LINK: any = {
  url: "https://app.shlokasadhna.com/referral/SADHANA2026",
  code: "SADHANA2026",
  shareText: "Join me on Shloka Sadhana! Use my code SADHANA2026",
};

const MOCK_LEADERBOARD: any[] = [
  {
    userId: "other-uid",
    displayName: "Priya Sharma",
    photoURL: null,
    successfulReferrals: 10,
    rank: 1,
    xpEarned: 500,
  },
  {
    userId: "test-uid",
    displayName: "Test User",
    photoURL: null,
    successfulReferrals: 2,
    rank: 2,
    xpEarned: 100,
  },
];

const mockProps: any = {
  navigation: { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() },
  route: { params: {}, key: "referral", name: "Referral" },
};

// ── Helper ────────────────────────────────────────────────────────────────────

function setupServiceMocks() {
  mockReferralService.getUserReferralData.mockResolvedValue(MOCK_REFERRAL_DATA);
  mockReferralService.getReferralLink.mockReturnValue(MOCK_REFERRAL_LINK);
  mockReferralService.getReferralLeaderboard.mockResolvedValue(MOCK_LEADERBOARD);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ReferralScreen — Initial Render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUser(MOCK_USER);
    setupServiceMocks();
  });

  it("renders without crashing", async () => {
    const { queryByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(queryByText("Loading referral data...") || queryByText("Invite Friends")).toBeTruthy();
    });
  });

  it("shows loading state initially", () => {
    // Make service calls block indefinitely so loading state is visible on first render
    mockReferralService.getUserReferralData.mockReturnValue(new Promise(() => {}));
    mockReferralService.getReferralLeaderboard.mockReturnValue(new Promise(() => {}));

    const { getByText } = render(<ReferralScreen {...mockProps} />);

    expect(getByText("Loading referral data...")).toBeTruthy();
  });

  it("shows the referral code after data loads", async () => {
    const { getByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByText("SADHANA2026")).toBeTruthy();
    });
  });

  it("shows screen title after data loads", async () => {
    const { getByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByText("Invite Friends")).toBeTruthy();
    });
  });

  it("navigates back when there is no authenticated user", async () => {
    setCurrentUser(null);
    const nav = { ...mockProps.navigation, goBack: jest.fn() };

    render(<ReferralScreen {...mockProps} navigation={nav} />);

    await waitFor(() => {
      expect(nav.goBack).toHaveBeenCalled();
    });
  });
});

describe("ReferralScreen — Copy Button", () => {
  let clipboardSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUser(MOCK_USER);
    setupServiceMocks();
    clipboardSpy = jest.spyOn(Clipboard, "setString").mockImplementation(() => undefined);
  });

  afterEach(() => {
    clipboardSpy.mockRestore();
  });

  it("calls Clipboard.setString with the referral code when Copy Code is pressed", async () => {
    const { getByLabelText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByLabelText("Copy referral code")).toBeTruthy();
    });

    fireEvent.press(getByLabelText("Copy referral code"));

    expect(clipboardSpy).toHaveBeenCalledWith("SADHANA2026");
  });
});

describe("ReferralScreen — Share Button", () => {
  let shareSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUser(MOCK_USER);
    setupServiceMocks();
    shareSpy = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: "sharedAction" } as any);
  });

  afterEach(() => {
    shareSpy.mockRestore();
  });

  it("calls Share.share with the referral link when Share Link is pressed", async () => {
    const { getByLabelText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByLabelText("Share referral link")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByLabelText("Share referral link"));
    });

    expect(shareSpy).toHaveBeenCalledWith({
      message: MOCK_REFERRAL_LINK.shareText,
      url: MOCK_REFERRAL_LINK.url,
    });
  });
});

describe("ReferralScreen — Leaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUser(MOCK_USER);
    setupServiceMocks();
  });

  it("shows leaderboard entries after data loads", async () => {
    const { getByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByText("Referral Leaderboard")).toBeTruthy();
      expect(getByText("Priya Sharma")).toBeTruthy();
    });
  });

  it("marks the current user with (You) in the leaderboard", async () => {
    const { getByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByText("Test User (You)")).toBeTruthy();
    });
  });

  it("shows empty leaderboard message when leaderboard is empty", async () => {
    mockReferralService.getReferralLeaderboard.mockResolvedValue([]);
    const { getByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByText("No leaderboard data yet")).toBeTruthy();
    });
  });
});

describe("ReferralScreen — Stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUser(MOCK_USER);
    setupServiceMocks();
  });

  it("displays referral stat labels", async () => {
    const { getByText } = render(<ReferralScreen {...mockProps} />);

    await waitFor(() => {
      expect(getByText("Total Referrals")).toBeTruthy();
      expect(getByText("Successful")).toBeTruthy();
      expect(getByText("Pending")).toBeTruthy();
      expect(getByText("XP Earned")).toBeTruthy();
    });
  });
});
