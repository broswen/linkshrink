# LinkShrink
### A completely serverless Link Shrinking system with click analytics.

![diagram](./LinkShrink.png)

### Usage

1. Send POST request with details to create a link. `clicks` defines if click events should be saved for analytics. `expires` defines when the link will return 404s and no longer redirect.

```json
{
    "link": "https://youtube.com",
    "clicks": true,
    "expires": "2021-07-22T20:55:00"
}
```

The response will list the slug (unique id) of the link.
```json
{
    "slug": "1vVGu3wpWWRiUZhXWJT7tElmzNw"
}
```
The full link will look like `https://test.com/1vVGu3wpWWRiUZhXWJT7tElmzNw`

2. Send a GET request to `test.com/link/1vVGu3wpWWRiUZhXWJT7tElmzNw` to get metadata about the link. `key` is the api key id used to create the link.
```json
{
    "slug": "1vVGu3wpWWRiUZhXWJT7tElmzNw",
    "link": "https://youtube.com",
    "key": "fp0y0hnmph",
    "clicks": true,
    "expires": "2021-07-22T20:55:00.000Z",
    "created": "2021-07-18T20:27:41.793Z"
}
```

3. Send a GET request to `test.com/link/1vVGu3wpWWRiUZhXWJT7tElmzNw/stats` to get statistics about the link. Currently this endpoint only returns the total clicks.

```json
{
    "slug": "1vVGu3wpWWRiUZhXWJT7tElmzNw",
    "count": 4
}
```

### In-Progress
4. Send a POST request to `test.com/link/1vVGu3wpWWRiUZhXWJT7tElmzNw/report` to start a workflow to generate a report of all click event activity for a specified time period.

```json
{
    "start": "2021-07-22T19:30:00.000Z",
    "end": "2021-07-22T20:54:00.000Z"
}
```

This will return a key which is where the generated report will be stored in S3.
``json
{
    "key": "1vVGu3wpWWRiUZhXWJT7tElmzNw-2021-07-22T20:54:00.000Z.csv"
}
```

### TODO List
- [ ] use typed errors
- [ ] create endpoint to trigger report workflow
- [ ] create endpoint to download report from s3