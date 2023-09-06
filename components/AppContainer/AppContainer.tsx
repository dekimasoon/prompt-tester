import classes from './AppContainer.module.css';

export type AppContainerProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

export const AppContainer: React.FC<AppContainerProps> = (props) => {
  return (
    <div className={classes.root}>
      {props.header}
      {props.children}
    </div>
  );
};
