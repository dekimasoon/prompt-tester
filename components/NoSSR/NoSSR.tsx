import React, { useEffect, useState } from 'react';

export type NoSSRProps = {
  children: React.ReactElement;
};

export const NoSSR: React.FC<NoSSRProps> = (props) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);

  return shouldRender ? props.children : <></>;
};
