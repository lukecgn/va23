function lda(array) {
  /**
   * Data Preprocessing
   */
  const fields = [
    "year",
    "minplayers",
    "maxplayers",
    "minplaytime",
    "maxplaytime",
    "minage",
    "rating.rating",
    "rating.num_of_reviews",
  ];

  const uniqueCategories = [
    ...new Set(
      array.flatMap((obj) =>
        obj["types"]["categories"].flatMap((category) => category.name)
      )
    ),
  ];

  const flattenedData = array
    .filter((obj) => obj.minplayers != 3)
    .map((obj) =>
      fields.map((fieldName) => {
        if (fieldName.includes(".")) {
          const path = fieldName.split(".");
          let nestedProperty = obj;
          for (let i = 0; i < path.length; i++) {
            nestedProperty = nestedProperty[path[i]];

            // Check if the nested property is undefined
            if (typeof nestedProperty === "undefined") {
              return undefined;
            }
          }

          return nestedProperty;
        }

        return obj[fieldName];
      })
    );

  const preprocessedData = flattenedData.map((data, idx) => [
    ...data,
    ...uniqueCategories.map((name) =>
      array[idx].types.categories.map(({ name }) => name).includes(name) ? 1 : 0
    ),
  ]);

  const fieldIndex = 1;
  const classes = preprocessedData.map((obj) => obj[fieldIndex]);
  for (var obj of preprocessedData) {
    obj.splice(fieldIndex, 1);
  }

  const X = druid.Matrix.from(preprocessedData);
  const reductionLDA = new druid.LDA(X, {
    labels: classes,
    d: 2,
  }); //2 dimensions, can use more.
  const result = reductionLDA.transform();
  const data = result.to2dArray.map((item, idx) => ({
    x: item[0],
    y: item[1],
    class: classes[idx],
  }));

  scatterplot.render("#lda", data, { classes });
}
