import React, {FC} from "react";
import {Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

export interface LegendItem {
  key: string,
  name: string;
  labelData: {[key: string]: string};
  color: string;
  checked: boolean;
}

export interface LegendProps {
  labels: LegendItem[];
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, legendItem: LegendItem) => void;
}

const useStyles = makeStyles({
  legendWrapper: {
    display: "grid",
    gridGap: "5px",
    width: "100%",
    gridTemplateColumns: "repeat(auto-fit)", // experiments like repeat(auto-fit, minmax(200px , auto)) may reduce size but readability as well
    gridColumnGap: ".5em",
    paddingLeft: "8px"
  }
});

export const Legend: FC<LegendProps> = ({labels, onClick}) => {
  const classes = useStyles();

  return <div>
    <div className={classes.legendWrapper}>
      {labels.map((legendItem: LegendItem) =>
        <div key={legendItem.key} style={{
          display: "flex",
          alignItems: "center",
          opacity: legendItem.checked ? 1 : 0.5,
        }}>
          <div onClick={(event) => { onClick(event, legendItem); }}
            style={{display: "flex", alignItems: "center", cursor: "pointer"}}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "14px",
              height: "14px",
              marginRight: "4px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              backgroundColor: legendItem.color,
            }}/>
            <Typography variant="body2">{legendItem.name}</Typography>
            <Typography variant="body2" style={{margin: "0 4px 0 8px"}}>{"{"}</Typography>
            {
              Object.keys(legendItem.labelData).map((labelKey) => (
                <Typography variant="body2" key="labelKey" style={{marginRight: "4px"}}>
                  <b>{labelKey}</b>:{legendItem.labelData[labelKey]}
                </Typography>
              ))
            }
            <Typography variant="body2">{"}"}</Typography>
          </div>
        </div>
      )}
    </div>
    <Typography style={{
      color: "rgba(0, 0, 0, 0.67)",
      padding: "9px 0",
      fontSize: "10px"
    }}>
      CTRL + click: toggle multiple series
    </Typography>
  </div>;
};