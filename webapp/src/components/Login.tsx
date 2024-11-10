import { Button, Page, PageContent, PageHeader } from "grommet-exp";
import { Form, FormField, TextInput } from "grommet";
export const Login = ({
  setAuthenticated,
}: {
  setAuthenticated: (arg: boolean) => void;
}) => {
  return (
    <Page>
      <PageContent>
        <PageHeader
          title="HPE Design Experiment"
          subtitle="Please log in to view the designs."
        />
        <Form
          onSubmit={({ value }: { value: { password: string } }) => {
            if (value.password === "password") {
              localStorage.setItem("hpe-design-experiment", "true");
              setAuthenticated(true);
            }
          }}
        >
          <FormField
            label="Password"
            name="password"
            htmlFor="password"
            contentProps={{ width: "medium" }}
          >
            <TextInput type="password" name="password" id="password" />
          </FormField>
          <Button label="Submit" type="submit" kind="primary" />
        </Form>
      </PageContent>
    </Page>
  );
};
