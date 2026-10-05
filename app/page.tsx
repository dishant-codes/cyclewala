import Nav from "@/components/layout/Nav";
import Scene from "@/components/layout/Scene";
import StackSection from "@/components/layout/StackSection";
import Hero from "@/components/sections/Hero/Hero";
import About from "@/components/sections/About/About";
import Shop from "@/components/sections/Shop/Shop";
import Services from "@/components/sections/Services/Services";
import Support from "@/components/sections/Support/Support";
import Gallery from "@/components/sections/Gallery/Gallery";
import Connect from "@/components/sections/Connect/Connect";

/*
 * Every section stacks: each one scrolls up, pins, and the next section
 * slides up over it (see components/layout/StackSection.tsx). Sections must
 * have an opaque background so the one beneath never shows through. Every
 * section rises vertically over the previous one (Services and Support used to
 * slide in from the right; they now rise like the rest).
 *
 * The Gallery keeps its own full-screen Scene (drift wall), and Connect
 * closes the page and rises over it. Paint order runs 1 → 6 → Connect.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <StackSection order={1} id="home">
          <Hero />
        </StackSection>
        <StackSection order={2} id="shop">
          <Shop />
        </StackSection>
        <StackSection order={3} id="about">
          <About />
        </StackSection>
        <StackSection order={4} id="services">
          <Services />
        </StackSection>
        <StackSection order={5} id="support">
          <Support />
        </StackSection>

        <Scene order={6} runway={1.6} id="gallery" keepOnMobile>
          <Gallery />
        </Scene>

        <div className="finalFrame">
          <Connect />
        </div>
      </main>
    </>
  );
}
