import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const res = await fetch("https://discord.com/api/users/@me/guilds", {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
          },
        });
        const guilds = await res.json();
        token.discordId = profile.id;
        token.isStabilityMember = guilds
          .map((guild: { id: string }) => guild.id)
          .includes(process.env.STABILITY_GUILD_ID);
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.discordId as string;
      session.user.isStabilityMember = token.isStabilityMember as boolean;
      return session;
    },
  },
});
