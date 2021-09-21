import React, {FC} from "react";
import {Typography, Tooltip} from "@material-ui/core";
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
    display: "inline-grid",
    width: "auto",
    gridTemplateColumns: "repeat(auto-fit)", // experiments like repeat(auto-fit, minmax(200px , auto)) may reduce size but readability as well
    gridColumnGap: ".5em",
  },
  legendSwatch: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "12px",
    marginRight: "8px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    padding: "3px",
    transition: "0.2s",
    "&:hover": {
      background: "rgba(0, 0, 0, 0.15)",
    },
  },
  legendData: {
    color: "#000",
    transition: "0.2s",
    "&:hover": {
      color: "#3F51B5",
    },
  }
});

const copyValue = async (key: string, value: string) => {
  await navigator.clipboard.writeText(`${key}="${value}"`);
};

export const Legend: FC<LegendProps> = ({labels, onClick}) => {
  const classes = useStyles();

  return <div>
    <div className={classes.legendWrapper}>
      {labels.map((legendItem: LegendItem) =>
        <div key={legendItem.key} className={classes.legendItem}
          style={{opacity: legendItem.checked ? 1 : 0.5}}>
          <div onClick={(event) => { onClick(event, legendItem); }}
            style={{display: "flex", alignItems: "center", width: "100%", cursor: "pointer"}}>
            <div className={classes.legendSwatch}
              style={{backgroundColor: legendItem.color}}/>
            <Typography variant="body2">{legendItem.name}</Typography>
            <Typography variant="body2" style={{margin: "0 4px 0 8px"}}>{"{"}</Typography>
            {
              Object.keys(legendItem.labelData).map((labelKey) => (
                <span className={classes.legendData} key={labelKey}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyValue(labelKey, legendItem.labelData[labelKey]);
                  }}>
                  <Tooltip title={`Copy '${labelKey}="${legendItem.labelData[labelKey]}"'`}>
                    <Typography variant="body2" style={{marginRight: "4px"}}>
                      <b>{labelKey}</b>:{legendItem.labelData[labelKey]}
                    </Typography>
                  </Tooltip>
                </span>
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