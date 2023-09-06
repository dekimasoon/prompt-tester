import classes from './PanelContainer.module.css';

export type PanelContainerProps = {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
};

export const PanelContainer: React.FC<PanelContainerProps> = (props) => {
  return (
    <div className={classes.root}>
      {props.leftPanel}
      {props.rightPanel}
    </div>
  );
};
