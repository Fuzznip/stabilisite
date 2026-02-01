export type Drop = {
  id: string;
  date: Date;
  player: string; // For display: submittedRsn if available, else rsn
  playerRsn?: string; // The actual account name (only in new format)
  itemName: string;
  quantity: string | number;
  itemSource: string;
  submitType: string;
  imgPath?: string | null;
  // Team ID for lookup (only in new format)
  teamId?: string;
};
