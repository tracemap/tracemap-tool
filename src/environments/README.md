# Create your own environment.ts here

<b>Make it look like this:</b>

```typescript
export const environment = {
  production: false
}

export const twitterAuth = {
  consumer_key: "",
  consumer_secret: "",
  access_token_key: "",
  access_token_secret: ""
}
```
## Receive the tokens:
 1. Go to https://apps.twitter.com
 2. Login and create a twitter app
 3. In your twitter app overview go to <b>Keys and Access Tokens</b>
 4. Add the shown tokens and secrets to your `twitterAuth` dict
