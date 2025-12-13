class api_features {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.mongoQuery = {}; 
  }

  // Filter: Handle direct filters and advanced operators
  // Examples: ?cuisine=Italian OR ?rating[gte]=4
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Handle advanced filtering: ?price[gte]=100&rating[lt]=5
    // Also handles direct filtering: ?cuisine=Italian&name=Pizza
    for (const key in queryObj) {
      if (key.includes('[')) {
        // Advanced operators (gte, gt, lte, lt, eq, ne)
        const [field, operator] = key.split('[');
        const cleanOperator = operator.replace(']', '');
        if (!this.mongoQuery[field]) this.mongoQuery[field] = {};
        this.mongoQuery[field][`$${cleanOperator}`] = isNaN(queryObj[key]) 
          ? queryObj[key] 
          : +queryObj[key];
      } else {
        // Direct match
        this.mongoQuery[key] = isNaN(queryObj[key]) 
          ? queryObj[key] 
          : +queryObj[key];
      }
    }

    return this;
  }

  // Search: Full-text search across multiple fields
 
  search(model_name) {
    if (this.queryString.search) {
      const search = this.queryString.search;
      let searchCondition;

      // Restaurant search
      if (model_name === 'restaurants') {
        searchCondition = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { cuisine: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } }
          ]
        };
      } 
      // Menu Items search
      else if (model_name === 'menu_items') {
        searchCondition = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ]
        };
      }
      // Orders search
      else if (model_name === 'orders') {
        searchCondition = {
          $or: [
            { status: { $regex: search, $options: 'i' } },
            { deliveryAddress: { $regex: search, $options: 'i' } }
          ]
        };
      }
      // Default: search by name
      else {
        searchCondition = {
          name: { $regex: search, $options: 'i' }
        };
      }

      // Combine with existing filters using $and
      if (Object.keys(this.mongoQuery).length > 0) {
        this.mongoQuery = { $and: [this.mongoQuery, searchCondition] };
      } else {
        this.mongoQuery = searchCondition;
      }
    }

    // Apply the query
    this.mongooseQuery = this.mongooseQuery.find(this.mongoQuery);
    return this;
  }

  // Sort: Order results
  // Examples: ?sort=-rating,name (descending rating, then ascending name)
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      // Default: newest first
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  // Limit Fields: Select specific fields to return
  // Examples: ?fields=name,cuisine,rating
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      // Default: exclude __v
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  // Paginate: Split results into pages
  // Examples: ?page=2&limit=10
  paginate(count_docs) {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    const end_index = page * limit;

    const pagination = {
      current_page: page,
      limit,
      total_pages: Math.ceil(count_docs / limit),
      total_docs: count_docs
    };

    // Add next page if there are more results
    if (end_index < count_docs) {
      pagination.next_page = page + 1;
    }

    // Add previous page if not on first page
    if (skip > 0) {
      pagination.previous_page = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.pagination_result = pagination;
    return this;
  }
}

module.exports = api_features;