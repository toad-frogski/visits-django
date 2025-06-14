import { useEffect, useState, type FC } from "react";
import { TextInput } from "../ui/components/input";
import Button from "../ui/components/button";
import { RfidApi } from "../lib/api";
import client from "../lib/api-client";

const rfidApi = new RfidApi(undefined, undefined, client);

const Profile: FC = () => {
  return <div className="p-3 md:p-6">
    <Avatar />
    <RFIDForm />
  </div>
}

const Avatar: FC = () => {

  return (
    <section className="max-w-[450px]">
      <h1 className="text-h2/h2 font-bold text-gray">Аватар</h1>
    </section>
  )
}

const RFIDForm: FC = () => {
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rfidApi.v1RfidRfidRetrieve().then(({ data }) => setToken(data.rfid_token));
  }, [])

  const submit = () => {
    setLoading(true);
    rfidApi.v1RfidRfidUpdate({ rfid_token: token })
      .catch(() => setError("не удалось сохранить"))
      .finally(() => setLoading(false));
  }

  return (
    <section className="max-w-[450px] mt-12">
      <h1 className="text-h2/h2 font-bold text-gray">RFID токен</h1>
      <div className="mt-6 flex gap-3">
        <TextInput
          className="h-fit"
          label={"Token"}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={error}
        />
        <Button className="h-[60px] max-w-24" onClick={submit} disabled={loading}>Сохранить</Button>
      </div>
    </section>
  )
}

export default Profile;
