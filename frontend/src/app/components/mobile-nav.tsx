import type { FC } from "react";

const MobileNav: FC = () => {
  return (
    <nav className="fixed bottom-0 w-full px-4">
      <ul className="flex gap-3 justify-between">
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
    </nav>
  );
};

export default MobileNav;
