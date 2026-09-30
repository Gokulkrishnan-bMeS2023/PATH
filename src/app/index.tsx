import { Redirect } from 'expo-router';

/** "/" → Welcome. (Signed-in users are routed onward by the root layout.) */
export default function Index() {
  return <Redirect href="/welcome" />;
}
