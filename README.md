

![cover](./public/social.png)


# Slop AI Avatar

An AI-powered tool for generating stunning custom avatars from your selfies with automatic feature generation.

**NEW:** Upload a selfie and let Claude AI automatically design your perfect avatar with custom AI-generated features for unique hairstyles and more!

I18n supported:

- [English](https://slop-ai-avatar.vercel.app/en)
- [简体中文](https://slop-ai-avatar.vercel.app/zh)

## Features

- 🤖 **AI-Powered Generation**: Upload a selfie and Claude Vision analyzes your features to select the perfect avatar combination
- ✨ **Custom Asset Generation**: AI automatically generates custom SVG assets for unique features (like unusual hairstyles) that don't match preset options
- 🎨 **Manual Customization**: Traditional manual part selection still available
- 🖼️ **SVG & PNG Export**: Download your avatar in multiple formats
- 🌐 **Internationalization**: Full support for English and Chinese
- 🔒 **Privacy First**: Photos are processed immediately and never stored
- 🎰 **Casino-Inspired Design**: Bold, eye-catching interface with gold and red accents

## Styles

- 😉 11 face shapes
- 👃🏼 11 noses
- 👄 11 mouths
- 👀 11 eyes
- 👁️ 11 eyebrows
- 🕶️ 10 glasses
- 💇‍♀️ 30 hairstyles
- 🎅🏼 10 beards
- 💋 10 facial details
- 💍 10 accessories

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mayandev/notion-avatar.git
   cd slop-ai-avatar
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install / yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   NEXT_PUBLIC_GOOGLE_ANALYTICS=your_ga_tracking_id (optional)
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

   Get your Anthropic API key from: https://console.anthropic.com/

4. **Run the development server**
   ```bash
   bun run dev
   # or npm run dev / yarn dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## Assets

- Illustration designer: [@Felix Wong](https://www.producthunt.com/@felix12777) on ProductHunt
- Pack of illustrations: [Noto avatar](https://abstractlab.gumroad.com/l/noto-avatar)
- Assets licensed under [CC0](https://creativecommons.org/publicdomain/zero/1.0/) <img src="./public/icon/cc0.svg" width="50"/>

## Tech Stack

- **Framework**: Next.js 11
- **AI**: Anthropic Claude (via Vercel AI SDK)
- **Styling**: Tailwind CSS
- **Internationalization**: next-i18next
- **Image Processing**: html2canvas, Puppeteer

## Contact

- Open an [issue](https://github.com/Mayandev/notion-avatar/issues) if you have any question about this app.
- DM me on [twitter](https://twitter.com/phillzou) is also welcome.

<a href='https://ko-fi.com/S6S16CGTC' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi5.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>


