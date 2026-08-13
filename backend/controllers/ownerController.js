const db = require("../config/db");

exports.getOwnerDashboard = (req, res) => {
  const ownerId = req.user.id;

  const storeQuery = `
    SELECT
      s.id,
      s.name,
      s.email,
      s.address,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.id) AS total_ratings
    FROM stores s
    LEFT JOIN ratings r
      ON s.id = r.store_id
    WHERE s.owner_id = ?
    GROUP BY
      s.id,
      s.name,
      s.email,
      s.address
  `;

  db.query(storeQuery, [ownerId], (storeError, stores) => {
    if (storeError) {
      console.error("Owner store query error:", storeError);

      return res.status(500).json({
        message: "Failed to load owner store"
      });
    }

    if (!stores || stores.length === 0) {
      return res.status(404).json({
        message: "No store assigned to this owner"
      });
    }

    const store = stores[0];

    const ratingsQuery = `
      SELECT
        r.id AS rating_id,
        r.rating,
        u.id AS user_id,
        u.name,
        u.email,
        u.address
      FROM ratings r
      INNER JOIN users u
        ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.id DESC
    `;

    db.query(
      ratingsQuery,
      [store.id],
      (ratingsError, ratings) => {
        if (ratingsError) {
          console.error(
            "Owner ratings query error:",
            ratingsError
          );

          return res.status(500).json({
            message: "Failed to load owner ratings"
          });
        }

        return res.status(200).json({
          message: "Owner dashboard loaded successfully",

          store: {
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            average_rating: Number(store.average_rating),
            total_ratings: Number(store.total_ratings)
          },

          ratings: ratings || []
        });
      }
    );
  });
};