# Send Email - Resend

> Source: https://resend.com/docs/api-reference/emails/send-email
> Cached: 2026-09-19T11:22:52.547Z

---

Node.jsPHPPythonRubyGoRustJava.NETcURLCLI```
import { Resend } from &#x27;resend&#x27;;

const resend = new Resend(&#x27;re_xxxxxxxxx&#x27;);

const { data, error } = await resend.emails.send({
  from: &#x27;Acme <onboarding@resend.dev>&#x27;,
  to: [&#x27;delivered@resend.dev&#x27;],
  subject: &#x27;hello world&#x27;,
  html: &#x27;<p>it works!</p>&#x27;,
});

```

```
$resend = Resend::client(&#x27;re_xxxxxxxxx&#x27;);

$resend->emails->send([
  &#x27;from&#x27; => &#x27;Acme <onboarding@resend.dev>&#x27;,
  &#x27;to&#x27; => [&#x27;delivered@resend.dev&#x27;],
  &#x27;subject&#x27; => &#x27;hello world&#x27;,
  &#x27;html&#x27; => &#x27;<p>it works!</p>&#x27;
]);

```

```
import resend

resend.api_key = "re_xxxxxxxxx"

params: resend.Emails.SendParams = {
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}

email = resend.Emails.send(params)
print(email)

```

```
require "resend"

Resend.api_key = "re_xxxxxxxxx"

params = {
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}

sent = Resend::Emails.send(params)
puts sent

```

```
package main

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v3"
)

func main() {
  ctx := context.TODO()
  client := resend.NewClient("re_xxxxxxxxx")

  params := &resend.SendEmailRequest{
      From:        "Acme <onboarding@resend.dev>",
      To:          []string{"delivered@resend.dev"},
      Subject:     "hello world",
      Html:        "<p>it works!</p>"
  }

  sent, err := client.Emails.SendWithContext(ctx, params)

  if err != nil {
    panic(err)
  }
  fmt.Println(sent.Id)
}

```

```
use resend_rs::types::{CreateEmailBaseOptions};
use resend_rs::{Resend, Result};

#[tokio::main]
async fn main() -> Result<()> {
  let resend = Resend::new("re_xxxxxxxxx");

  let from = "Acme <onboarding@resend.dev>";
  let to = ["delivered@resend.dev"];
  let subject = "hello world";
  let html = "<p>it works!</p>";

  let email = CreateEmailBaseOptions::new(from, to, subject)
    .with_html(html);

  let _email = resend.emails.send(email).await?;

  Ok(())
}

```

```
import com.resend.*;

public class Main {
    public static void main(String[] args) {
        Resend resend = new Resend("re_xxxxxxxxx");

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("Acme <onboarding@resend.dev>")
                .to("delivered@resend.dev")
                .subject("hello world")
                .html("<p>it works!</p>")
                .build();

        CreateEmailResponse data = resend.emails().send(params);
    }
}

```

```
using Resend;

IResend resend = ResendClient.Create( "re_xxxxxxxxx" ); // Or from DI

var resp = await resend.EmailSendAsync( new EmailMessage()
{
    From = "Acme <onboarding@resend.dev>",
    To = "delivered@resend.dev",
    Subject = "hello world",
    HtmlBody = "<p>it works!</p>",
} );
Console.WriteLine( "Email Id={0}", resp.Content );

```

```
curl -X POST &#x27;https://api.resend.com/emails&#x27; \
     -H &#x27;Authorization: Bearer re_xxxxxxxxx&#x27; \
     -H &#x27;Content-Type: application/json&#x27; \
     -d $&#x27;{
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}&#x27;

```

```
resend emails send \
  --from "Acme <onboarding@resend.dev>" \
  --to delivered@resend.dev \
  --subject "hello world" \
  --html "<p>it works!</p>"

```

Response```
{
  "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
}

```

[Sending](/docs/api-reference/emails/send-email)# Send Email

Copy pageCopy pageStart sending emails through the Resend Email API.

Copy pageCopy pagePOST/emailsNode.jsPHPPythonRubyGoRustJava.NETcURLCLI```
import { Resend } from &#x27;resend&#x27;;

const resend = new Resend(&#x27;re_xxxxxxxxx&#x27;);

const { data, error } = await resend.emails.send({
  from: &#x27;Acme <onboarding@resend.dev>&#x27;,
  to: [&#x27;delivered@resend.dev&#x27;],
  subject: &#x27;hello world&#x27;,
  html: &#x27;<p>it works!</p>&#x27;,
});

```

```
$resend = Resend::client(&#x27;re_xxxxxxxxx&#x27;);

$resend->emails->send([
  &#x27;from&#x27; => &#x27;Acme <onboarding@resend.dev>&#x27;,
  &#x27;to&#x27; => [&#x27;delivered@resend.dev&#x27;],
  &#x27;subject&#x27; => &#x27;hello world&#x27;,
  &#x27;html&#x27; => &#x27;<p>it works!</p>&#x27;
]);

```

```
import resend

resend.api_key = "re_xxxxxxxxx"

params: resend.Emails.SendParams = {
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}

email = resend.Emails.send(params)
print(email)

```

```
require "resend"

Resend.api_key = "re_xxxxxxxxx"

params = {
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}

sent = Resend::Emails.send(params)
puts sent

```

```
package main

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v3"
)

func main() {
  ctx := context.TODO()
  client := resend.NewClient("re_xxxxxxxxx")

  params := &resend.SendEmailRequest{
      From:        "Acme <onboarding@resend.dev>",
      To:          []string{"delivered@resend.dev"},
      Subject:     "hello world",
      Html:        "<p>it works!</p>"
  }

  sent, err := client.Emails.SendWithContext(ctx, params)

  if err != nil {
    panic(err)
  }
  fmt.Println(sent.Id)
}

```

```
use resend_rs::types::{CreateEmailBaseOptions};
use resend_rs::{Resend, Result};

#[tokio::main]
async fn main() -> Result<()> {
  let resend = Resend::new("re_xxxxxxxxx");

  let from = "Acme <onboarding@resend.dev>";
  let to = ["delivered@resend.dev"];
  let subject = "hello world";
  let html = "<p>it works!</p>";

  let email = CreateEmailBaseOptions::new(from, to, subject)
    .with_html(html);

  let _email = resend.emails.send(email).await?;

  Ok(())
}

```

```
import com.resend.*;

public class Main {
    public static void main(String[] args) {
        Resend resend = new Resend("re_xxxxxxxxx");

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("Acme <onboarding@resend.dev>")
                .to("delivered@resend.dev")
                .subject("hello world")
                .html("<p>it works!</p>")
                .build();

        CreateEmailResponse data = resend.emails().send(params);
    }
}

```

```
using Resend;

IResend resend = ResendClient.Create( "re_xxxxxxxxx" ); // Or from DI

var resp = await resend.EmailSendAsync( new EmailMessage()
{
    From = "Acme <onboarding@resend.dev>",
    To = "delivered@resend.dev",
    Subject = "hello world",
    HtmlBody = "<p>it works!</p>",
} );
Console.WriteLine( "Email Id={0}", resp.Content );

```

```
curl -X POST &#x27;https://api.resend.com/emails&#x27; \
     -H &#x27;Authorization: Bearer re_xxxxxxxxx&#x27; \
     -H &#x27;Content-Type: application/json&#x27; \
     -d $&#x27;{
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}&#x27;

```

```
resend emails send \
  --from "Acme <onboarding@resend.dev>" \
  --to delivered@resend.dev \
  --subject "hello world" \
  --html "<p>it works!</p>"

```

Response```
{
  "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
}

```

## [​](#body-parameters)Body Parameters

[​](#param-from)fromstringrequiredSender email address.To include a friendly name, pass the sender as `Name <email@example.com>`, for example `Acme <onboarding@example.dev>`.
[​](#param-to)tostring | string[]requiredRecipient email address. For multiple addresses, send as an array of strings.
Max 50.
[​](#param-subject)subjectstringrequiredEmail subject.
[​](#param-bcc)bccstring | string[]Bcc recipient email address. For multiple addresses, send as an array of
strings.
[​](#param-cc)ccstring | string[]Cc recipient email address. For multiple addresses, send as an array of
strings.

[​](#param-html)htmlstringThe HTML version of the message.
[​](#param-text)textstringThe plain text version of the message.If not provided, the HTML will be used to generate a plain text version. You
can opt out of this behavior by setting value to an empty string.
[​](#param-react)reactReact.ReactNodeThe React component used to write the message. Only available in the Node.js
SDK.
[​](#param-headers)headersobjectCustom headers to add to the email.

[​](#param-attachments)attachmentsarrayFilename and content of attachments (max 40MB per email, after Base64 encoding of the attachments).[See examples](/docs/dashboard/emails/attachments)Hide properties

[​](#param-content)contentbuffer | stringContent of an attached file, passed as a buffer or Base64 string.[​](#param-filename)filenamestringName of attached file.[​](#param-path)pathstringPath where the attachment file is hosted
[​](#param-tags)tagsarrayCustom data passed in key/value pairs.[See examples](/docs/dashboard/emails/tags).Hide properties

[​](#param-name)namestringrequiredThe name of the email tag.It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-).It can contain no more than 256 characters.[​](#param-value)valuestringrequiredThe value of the email tag.It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-).It can contain no more than 256 characters.
[​](#param-template)templateobjectTo send using a template, provide a `template` object with:

- `id`: the id *or* the alias of the published template

- `variables`: an object with a key for each variable (if applicable)

If a `template` is provided, you cannot send `html`, `text`, or `react` in the payload, otherwise the API will return a validation error.When sending a template, the payload for `from`, `subject`, and `reply_to` take precedence over the template’s defaults for these fields. If the template does not provide a default value for these fields, you must provide them in the payload.
[​](#param-id)idstringrequiredThe id of the published email template. Required if `template` is provided. Only published templates can be used when sending emails.
[​](#param-variables)variablesobjectTemplate variables object with key/value pairs.```
variables: {
	CTA: &#x27;Sign up now&#x27;,
	CTA_LINK: &#x27;https://example.com/signup&#x27;
}

```

When sending the template, the HTML will be parsed. If all the variables used in the template were provided, the email will be sent. If not, the call will throw a validation error.See the [errors reference](/docs/api-reference/errors) for more details or [learn more about templates](/docs/dashboard/templates/introduction).Hide properties

[​](#param-key)keystringrequiredThe key of the variable.May only contain ASCII letters (a–z, A–Z), numbers (0–9), and underscores (_). The following variable names are reserved and cannot be used: `FIRST_NAME`, `LAST_NAME`, `EMAIL`, `UNSUBSCRIBE_URL`.It can contain no more than 50 characters.[​](#param-value-1)valuestring | numberrequiredThe value of the variable.Observe these technical limitations:

- `string`: maximum length of 2,000 characters

- `number`: not greater than 2^53 - 1

## [​](#headers)Headers

[​](#param-idempotency-key)Idempotency-KeystringAdd an idempotency key to prevent duplicated emails.

- Should be **unique per API request**

- Idempotency keys expire after **24 hours**

- Have a maximum length of **256 characters**

[Learn more](/docs/dashboard/emails/idempotency-keys)
Node.jsPHPPythonRubyGoRustJava.NETcURLCLI```
import { Resend } from &#x27;resend&#x27;;

const resend = new Resend(&#x27;re_xxxxxxxxx&#x27;);

const { data, error } = await resend.emails.send({
  from: &#x27;Acme <onboarding@resend.dev>&#x27;,
  to: [&#x27;delivered@resend.dev&#x27;],
  subject: &#x27;hello world&#x27;,
  html: &#x27;<p>it works!</p>&#x27;,
});

```

```
$resend = Resend::client(&#x27;re_xxxxxxxxx&#x27;);

$resend->emails->send([
  &#x27;from&#x27; => &#x27;Acme <onboarding@resend.dev>&#x27;,
  &#x27;to&#x27; => [&#x27;delivered@resend.dev&#x27;],
  &#x27;subject&#x27; => &#x27;hello world&#x27;,
  &#x27;html&#x27; => &#x27;<p>it works!</p>&#x27;
]);

```

```
import resend

resend.api_key = "re_xxxxxxxxx"

params: resend.Emails.SendParams = {
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}

email = resend.Emails.send(params)
print(email)

```

```
require "resend"

Resend.api_key = "re_xxxxxxxxx"

params = {
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}

sent = Resend::Emails.send(params)
puts sent

```

```
package main

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v3"
)

func main() {
  ctx := context.TODO()
  client := resend.NewClient("re_xxxxxxxxx")

  params := &resend.SendEmailRequest{
      From:        "Acme <onboarding@resend.dev>",
      To:          []string{"delivered@resend.dev"},
      Subject:     "hello world",
      Html:        "<p>it works!</p>"
  }

  sent, err := client.Emails.SendWithContext(ctx, params)

  if err != nil {
    panic(err)
  }
  fmt.Println(sent.Id)
}

```

```
use resend_rs::types::{CreateEmailBaseOptions};
use resend_rs::{Resend, Result};

#[tokio::main]
async fn main() -> Result<()> {
  let resend = Resend::new("re_xxxxxxxxx");

  let from = "Acme <onboarding@resend.dev>";
  let to = ["delivered@resend.dev"];
  let subject = "hello world";
  let html = "<p>it works!</p>";

  let email = CreateEmailBaseOptions::new(from, to, subject)
    .with_html(html);

  let _email = resend.emails.send(email).await?;

  Ok(())
}

```

```
import com.resend.*;

public class Main {
    public static void main(String[] args) {
        Resend resend = new Resend("re_xxxxxxxxx");

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("Acme <onboarding@resend.dev>")
                .to("delivered@resend.dev")
                .subject("hello world")
                .html("<p>it works!</p>")
                .build();

        CreateEmailResponse data = resend.emails().send(params);
    }
}

```

```
using Resend;

IResend resend = ResendClient.Create( "re_xxxxxxxxx" ); // Or from DI

var resp = await resend.EmailSendAsync( new EmailMessage()
{
    From = "Acme <onboarding@resend.dev>",
    To = "delivered@resend.dev",
    Subject = "hello world",
    HtmlBody = "<p>it works!</p>",
} );
Console.WriteLine( "Email Id={0}", resp.Content );

```

```
curl -X POST &#x27;https://api.resend.com/emails&#x27; \
     -H &#x27;Authorization: Bearer re_xxxxxxxxx&#x27; \
     -H &#x27;Content-Type: application/json&#x27; \
     -d $&#x27;{
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}&#x27;

```

```
resend emails send \
  --from "Acme <onboarding@resend.dev>" \
  --to delivered@res

... [Content truncated]