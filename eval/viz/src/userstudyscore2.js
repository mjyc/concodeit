const tableau10 = {
  blue: "#1f77b4",
  orange: "#ff7f0e",
  red: "#d62728",
  cyan: "#17becf",
  green: "#2ca02c",
  lime: "#bcbd22",
  purple: "#9467bd",
  magenta: "#e377c2",
  brown: "#8c564b",
  gray: "#7f7f7f",
};

const main = (data) => {
  console.log(data);
  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data,
    },
    transform: [
      {
        filter: "datum['skip?'] == 'FALSE'",
      },
      {
        calculate: "(indexof(datum.classes, 'CSE 332') != -1) ? 'yes' : 'no'",
        as: "tookCSE332",
      },
    ],
    layer: [
      {
        mark: {
          type: "point",
        },
        encoding: {
          x: {
            field: "numTotalBlocks",
            type: "quantitative",
            axis: { title: "Number of Blocks" },
          },
          y: {
            field: "main",
            type: "quantitative",
            axis: { title: "Scores" },
          },
          color: { field: "tookCSE332" },
        },
      },
      {
        transform: [
          {
            filter: "datum.tookCSE332 == 'yes'",
          },
        ],
        mark: { type: "rule", color: tableau10.orange },
        encoding: {
          x: {
            aggregate: "average",
            field: "numTotalBlocks",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "datum.tookCSE332 == 'no'",
          },
        ],
        mark: { type: "rule", color: tableau10.blue },
        encoding: {
          x: {
            aggregate: "average",
            field: "numTotalBlocks",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "datum.tookCSE332 == 'yes'",
          },
        ],
        mark: { type: "rule", color: tableau10.orange },
        encoding: {
          y: {
            aggregate: "average",
            field: "main",
            type: "quantitative",
          },
        },
      },
      {
        transform: [
          {
            filter: "datum.tookCSE332 == 'no'",
          },
        ],
        mark: { type: "rule", color: tableau10.blue },
        encoding: {
          y: {
            aggregate: "average",
            field: "main",
            type: "quantitative",
          },
        },
      },
    ],
  };
  vegaEmbed("#vis", vlSpec);
};

fetch("/dist/userstudyresp.json")
  .then((response) => {
    return response.json();
  })
  .then((rawData) => {
    main(rawData);
  });
