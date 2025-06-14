import { useEffect, useState, type FC } from "react";
import { TextInput } from "@/ui/components/input";
import Button from "@/ui/components/button";
import { AvatarApi, RfidApi } from "@/lib/api";
import client from "@/lib/api-client";
import UploadImage from "@/ui/components/upload-image";

const rfidApi = new RfidApi(undefined, undefined, client);
const avatarApi = new AvatarApi(undefined, undefined, client);

const Profile: FC = () => {
  return (
    <div className="p-3 md:p-6">
      <AvatarForm />
      <RfidForm />
    </div>
  );
};

const AvatarForm: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File>();

  const submit = () => {
    if (file) {
      setLoading(true);
      avatarApi
        .v1SessionAvatarUpdate(file)
        .then(() => setError(""))
        .catch(() => setError("Не удалось сохранить"))
        .finally(() => setLoading(false));
    }
  };

  return (
    <section className="max-w-[450px]">
      <h1 className="text-h2/h2 font-bold text-gray">Аватар</h1>
      <UploadImage className="mt-3" onFileSelect={setFile} error={error} />
      <Button className="max-h-[60px] mt-3" onClick={submit} disabled={loading}>
        Сохранить
      </Button>
    </section>
  );
};

const RfidForm: FC = () => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rfidApi.v1RfidRfidRetrieve().then(({ data }) => setToken(data.rfid_token));
  }, []);

  const submit = () => {
    setLoading(true);
    rfidApi
      .v1RfidRfidUpdate({ rfid_token: token })
      .then(() => setError(""))
      .catch(() => setError("Не удалось сохранить"))
      .finally(() => setLoading(false));
  };

  return (
    <section className="max-w-[450px] mt-12">
      <h1 className="text-h2/h2 font-bold text-gray">RFID токен</h1>
      <div className="mt-6 flex gap-3">
        <TextInput
          className="h-fit"
          placeholder={"Token"}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={error}
        />
        <Button
          className="max-h-[60px] max-w-32"
          onClick={submit}
          disabled={loading}
        >
          Сохранить
        </Button>
      </div>
    </section>
  );
};

export default Profile;
