import { Link } from '@chakra-ui/react';
import * as React from 'react';

interface Props {
  href?: string;
  children: JSX.Element;
}
const SurroundLinkIfHref = ({ href, children }: Props) => {
  if (!href) return children;
  return <Link href={href}>{children}</Link>;
};

export default SurroundLinkIfHref;
