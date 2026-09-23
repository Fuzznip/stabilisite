import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/magicui/text-animate";
import type { User } from "@/lib/types";

/** The Discord CTA only renders when an invite is actually configured —
 *  better no button than a dead link. Set NEXT_PUBLIC_DISCORD_INVITE_URL to
 *  turn it on. */
const DISCORD_INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;

export function HomeHero({
  user,
}: {
  user: User | null | undefined;
}): React.ReactElement {
  // Everyone gets the same pitch; only the primary call to action changes,
  // since "Apply" is meaningless to someone already signed in.
  //
  // Gated on discordId, not merely on being signed in: getAuthUser() falls
  // back to the bare session when a Discord login has no clan record yet, and
  // that object carries no discordId — linking on it would produce
  // /profile/undefined. Someone with no record should be applying anyway.
  const profileHref = user?.discordId ? `/profile/${user.discordId}` : null;

  return (
    <section className="pt-10 pb-2 sm:pt-16">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stability-accent">
        Old School RuneScape
      </span>

      <TextAnimate
        as="h1"
        animation="blurInUp"
        by="character"
        once
        duration={0.5}
        className="mt-4 text-6xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl"
      >
        Stability
      </TextAnimate>

      <TextAnimate
        as="p"
        animation="blurInUp"
        by="word"
        once
        delay={0.35}
        duration={0.6}
        className="mt-5 max-w-xl text-lg text-foreground/70 sm:text-xl"
      >
        Raids, bossing, and clan events. Every split, achievement and rank
        tracked on this site. Find a group for any content.
      </TextAnimate>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          asChild
          size="lg"
          className="bg-stability text-white hover:bg-stability/90"
        >
          {profileHref ? (
            <Link href={profileHref}>
              See your profile
              <ArrowRight aria-hidden className="ml-1 size-4" />
            </Link>
          ) : (
            <Link href="/apply">
              Apply to Stability
              <ArrowRight aria-hidden className="ml-1 size-4" />
            </Link>
          )}
        </Button>
        {DISCORD_INVITE && (
          <Button asChild size="lg" variant="outline">
            <Link
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the Discord
            </Link>
          </Button>
        )}
        <Button asChild size="lg" variant="ghost">
          <Link href="/leaderboards">See the leaderboards</Link>
        </Button>
      </div>
    </section>
  );
}
