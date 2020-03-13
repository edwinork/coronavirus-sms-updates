<p style="text-align:center">
  <img src="https://imageog.flaticon.com/icons/png/512/30/30992.png?size=1200x630f&pad=10,10,10,10&ext=png&bg=FFFFFFFF" alt="Corona Logo" width="300" height="157">
</p>

# Coronavirus(COVID-19) SMS Updates

_NOTE: This is a prototype. The goal is to make it into a usable CLI tool._

Sends SMS notifications with latest Coronavirus(COVID-19) statistics.

## Getting Started

### Environment Variables

Create `.env` file in the root directory. It will populate `process.env` with variables that you must define in the file. Example:
```shell script
# Gmail user account that will be used for sending.
# Note that Google limits regular users to 500 outgoing emails a day.
GMAIL_USER=example@gmail.com

# Gmail password. If you have 2-factor authentication enabled, use:
# [My Account -> Sign-in & security -> Signing in to Google -> App passwords]
GMAIL_PASS=password12345

# Mobile phone number that will receive SMS notification. Must be in the same format as example below.
PHONE_NUMBER=7773331111

# A mobile carrier company associated with PHONE_NUMBER. List of supported carriers:
# [t-mobile, verizon, att, sprint, virgin-mobile, us-cellular, nextel, alltel]
CARRIER=t-mobile

# Comma-delimited (no spaces in between) list of states which should appear in the SMS notification.
STATES_LIST=West Virginia,Arizona,California
```

### Building and Running

1. Install Node.js
2. Install NPM packages:
    ```shell script
    $ npm install
    ```
3. Run once (results in one SMS notification):
    ```shell script
    $ npm start
    ```

## SMS Notification Example

```text
  WORLD
    confirmed: 128343
    deaths: 4720
    recovered: 68324

  WEST VIRGINIA
    confirmed: 0
    deaths: 0
    recovered: 0

  ARIZONA
    confirmed: 9
    deaths: 0
    recovered: 1

  CALIFORNIA
    confirmed: 221
    deaths: 4
    recovered: 6

```
## Authors

* **EdwinOrk** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
